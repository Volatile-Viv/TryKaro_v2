const Product = require("../models/Product");
const { validationResult } = require("express-validator");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Build query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit", "search"];

    // Remove fields from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Filter by search term
    let query = {};
    if (req.query.search) {
      query = {
        $or: [
          { title: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
          { tags: { $in: [new RegExp(req.query.search, "i")] } },
        ],
      };
    }

    // Filter by category
    if (reqQuery.category) {
      query.category = reqQuery.category;
    }

    // Filter by status
    if (reqQuery.status) {
      query.status = reqQuery.status;
    }

    // Filter by maker
    if (reqQuery.maker) {
      query.maker = reqQuery.maker;
    }

    // Find products
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Merge with search query if exists
    const finalQuery = { ...query, ...JSON.parse(queryStr) };

    // Finding resource
    let result = Product.find(finalQuery);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      result = result.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      result = result.sort(sortBy);
    } else {
      result = result.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(finalQuery);

    result = result.skip(startIndex).limit(limit);

    // Populate with Brand info
    result = result.populate({
      path: "maker",
      select: "name avatar",
    });

    // Executing query
    const products = await result;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      total,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "maker",
        select: "name avatar bio",
      })
      .populate({
        path: "reviews",
        populate: {
          path: "tester",
          select: "name avatar",
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    // Check if error is due to invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Remove the check for files - make image upload optional
    // If an image URL is provided in the request body, use that instead

    // Process inventory management - if manageInventory is false, set inventory to null
    if (req.body.manageInventory === false) {
      req.body.inventory = null;
    }

    // Add maker to req.body
    req.body.maker = req.user.id;
    
    // Create product
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Product owner or Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Make sure user is product owner or admin
    if (product.maker.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Process inventory management - if manageInventory is false, set inventory to null
    if (req.body.manageInventory === false) {
      req.body.inventory = null;
    }

    // Update with the provided fields including image URL if provided
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Product owner or Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Make sure user is product owner or admin
    if (product.maker.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
