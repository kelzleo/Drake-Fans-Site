const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '' // Optional: Provide a default empty string
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: false
    },
    category: { type: String, 
        required: true }, 
    
});

// Middleware to handle slug and HTML sanitization
articleSchema.pre('validate', function (next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    if (this.markdown) {
        const markedContent = marked.parse(this.markdown); // Ensures correct usage of marked
        this.sanitizedHtml = dompurify.sanitize(markedContent);
    }

    next();
});

module.exports = mongoose.model('Article', articleSchema);
