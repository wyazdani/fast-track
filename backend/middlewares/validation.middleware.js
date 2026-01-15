const Joi = require('joi');
const expressAsyncHandler = require("express-async-handler");

// Claim schema validation
const claimSchema = Joi.object({
    patientId: Joi.string().required().trim().messages({
        'string.empty': 'patientId is required and must be a non-empty string',
        'any.required': 'patientId is required'
    }),
    procedureCode: Joi.string().required().trim().messages({
        'string.empty': 'procedureCode is required and must be a non-empty string',
        'any.required': 'procedureCode is required'
    }),
    scanType: Joi.string().required().valid('MRI', 'CT', 'mri', 'ct').uppercase().messages({
        'any.only': 'scanType must be either "MRI" or "CT"',
        'any.required': 'scanType is required'
    }),
    bodyPart: Joi.string().required().trim().messages({
        'string.empty': 'bodyPart is required and must be a non-empty string',
        'any.required': 'bodyPart is required'
    }),
    dateOfService: Joi.string().required().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
        'string.pattern.base': 'dateOfService must be in YYYY-MM-DD format',
        'any.required': 'dateOfService is required'
    }),
    referringPhysician: Joi.string().required().trim().messages({
        'string.empty': 'referringPhysician is required and must be a non-empty string',
        'any.required': 'referringPhysician is required'
    }),
    performingFacility: Joi.string().required().trim().messages({
        'string.empty': 'performingFacility is required and must be a non-empty string',
        'any.required': 'performingFacility is required'
    }),
    attachedDocumentation: Joi.array().items(Joi.string().trim().min(1)).default([]).messages({
        'array.base': 'attachedDocumentation must be an array',
        'string.empty': 'attachedDocumentation items must be non-empty strings',
        'string.min': 'attachedDocumentation items must be non-empty strings'
    }),
    billedAmount: Joi.number().required().positive().messages({
        'number.base': 'billedAmount must be a valid number',
        'number.positive': 'billedAmount must be a positive number',
        'any.required': 'billedAmount is required'
    }),
    diagnosisCodes: Joi.array().items(Joi.string().trim()).min(1).required().messages({
        'array.base': 'diagnosisCodes must be an array',
        'array.min': 'diagnosisCodes must contain at least one ICD-10 code',
        'any.required': 'diagnosisCodes is required'
    }),
    insuranceProvider: Joi.string().required().trim().messages({
        'string.empty': 'insuranceProvider is required and must be a non-empty string',
        'any.required': 'insuranceProvider is required'
    }),
    authorizationCode: Joi.string().optional().allow(null, '').trim().messages({
        'string.base': 'authorizationCode must be a string if provided'
    })
}).unknown(false); // Reject unknown fields

const validateClaim = expressAsyncHandler(async (req, res, next) => {
    const { error, value } = claimSchema.validate(req.body, {
        abortEarly: false, // Return all errors, not just the first one
        stripUnknown: true // Remove unknown fields
    });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        res.status(400).json({
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
});

module.exports = { validateClaim };

