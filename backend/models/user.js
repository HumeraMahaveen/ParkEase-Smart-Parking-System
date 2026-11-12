
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer", "admin", "operator", "security", "attendant"],
    default: "customer"
  },
  phone: {
    type: String
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;
