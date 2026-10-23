const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Todo title is required'],
      trim: true,
      minlength: [1, 'Todo title cannot be empty'],
      maxlength: [500, 'Todo title cannot exceed 500 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on createdAt for sorting performance
todoSchema.index({ createdAt: -1 });

// Ensure JSON outputs include both id and _id for seamless client compatibility
todoSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

module.exports = Todo;
