/**
 * Database module for MovieMap
 * 
 * This module uses Firestore for both development and production environments,
 * providing a consistent database experience across all environments.
 */

// Simply export the Firestore module directly
console.log('Using Firestore database for all environments');
module.exports = require('./firestore');