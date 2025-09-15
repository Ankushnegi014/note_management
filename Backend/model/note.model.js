const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  access: { type: String, enum: ['owner','editor','viewer'], required: true }
}, { _id: false });

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    permissions: {
      type: [PermissionSchema],
      default: []
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

noteSchema.pre('save', function(next) {
  if (this.isNew && this.owner) {
    const ownerId = this.owner.toString();
    const hasOwner = (this.permissions || []).some(p => p.user.toString() === ownerId);
    if (!hasOwner) {
      this.permissions = [{ user: this.owner, access: 'owner' }, ...(this.permissions || [])];
    }
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
