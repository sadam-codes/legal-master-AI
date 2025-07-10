// controllers/userController.js
import { User } from '../models/index.js';
import { Op } from 'sequelize';
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class UserController {
    // Get all users
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                where: { role: 'user' },
                attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpiry'] }
            });

            return res.status(200).json({
                success: true,
                users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        const { id } = req.params;

        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpiry'] }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get current user profile
    static async getCurrentUser(req, res) {
        try {
            // User is added to req by authMiddleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpiry'] }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error fetching current user profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Update current user profile
    static async updateCurrentUser(req, res) {
        try {
            // User is added to req by authMiddleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { name, email, username } = req.body;
            const userId = req.user.id;

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if email is being updated and is already in use by another user
            if (email && email !== user.email) {
                const existingUserByEmail = await User.findOne({
                    where: {
                        email,
                        id: { [Op.ne]: userId } // Not equal to current user id
                    }
                });

                if (existingUserByEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email is already in use'
                    });
                }
            }

            // Check if username is being updated and is already taken by another user
            if (username && username !== user.username) {
                const existingUserByUsername = await User.findOne({
                    where: {
                        username,
                        id: { [Op.ne]: userId } // Not equal to current user id
                    }
                });

                if (existingUserByUsername) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is already taken'
                    });
                }
            }

            // Update user fields if they're provided
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (username) updateData.username = username;

            await user.update(updateData);

            // Fetch the updated user
            const updatedUser = await User.findByPk(userId, {
                attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpiry'] }
            });

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({
                success: false,
                message: `Internal server error: ${error.message}`
            });
        }
    }

    // Create a new user
    static async createUser(req, res) {
        const { name, email, username, password, role, isActive } = req.body;

        try {
            // Check if email already exists
            const existingUserByEmail = await User.findOne({ where: { email } });
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }

            // Check if username already exists
            const existingUserByUsername = await User.findOne({ where: { username } });
            if (existingUserByUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            //  Created Stripe customer
            const stripeCustomer = await stripe.customers.create({
                email,
                name,
            });

            // Created the user and save stripeCustomerId
            const newUser = await User.create({
                name,
                email,
                username,
                password,
                role: role || 'user',
                isActive: isActive !== undefined ? isActive : false,
                stripeCustomerId: stripeCustomer.id,
            });
            const userResponse = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                isActive: newUser.isActive,
                stripeCustomerId: newUser.stripeCustomerId,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            };

            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: userResponse
            });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                success: false,
                message: `Internal server error: ${error.message}`
            });
        }
    }


    // Update user by ID
    static async updateUser(req, res) {
        const { id } = req.params;
        const { name, email, username, role, isActive, password } = req.body;

        try {
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if email is being updated and is already in use by another user
            if (email && email !== user.email) {
                const existingUserByEmail = await User.findOne({
                    where: {
                        email,
                        id: { [Op.ne]: id } // Not equal to current user id
                    }
                });

                if (existingUserByEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email is already in use'
                    });
                }
            }

            // Check if username is being updated and is already taken by another user
            if (username && username !== user.username) {
                const existingUserByUsername = await User.findOne({
                    where: {
                        username,
                        id: { [Op.ne]: id } // Not equal to current user id
                    }
                });

                if (existingUserByUsername) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is already taken'
                    });
                }
            }

            // Update user fields if they're provided
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (username) updateData.username = username;
            if (role) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (password) updateData.password = password;

            await user.update(updateData);

            // Fetch the updated user
            const updatedUser = await User.findByPk(id, {
                attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpiry'] }
            });

            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({
                success: false,
                message: `Internal server error: ${error.message}`
            });
        }
    }

    // Delete user by ID
    static async deleteUser(req, res) {
        const { id } = req.params;

        try {
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await user.destroy();

            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getUserCredits(req, res) {
        try {
            // User is added to req by authMiddleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userId = req.user.id;

            const user = await User.findByPk(userId, {
                attributes: ['id', 'name', 'email', 'credits']
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                credits: user.credits
            });
        } catch (error) {
            console.error('Error fetching user credits:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default UserController; 