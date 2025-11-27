import express from 'express';

import { AuthService } from '../services/auth.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/error-messages';
import { error } from 'console';
import { errorMonitor } from 'events';



const router = express.Router();
const authService = new AuthService();

// POST /internal/auth/register
router.post('/register', async (req, res) => {
  try {
    const {email , password} = req.body
    if(!email || !password){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Email and password are required'
      })
    }
    const result = await authService.registerUser({email , password})
     return res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    if(error instanceof Error && error.message.includes('already exists')){
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: error.message
      })
    }

   return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
});

// POST /internal/auth/login
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    if(!email || !password){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Email and password are required'})
      }
      const result = await authService.authenticateUser({email,password})

      return res.status(HTTP_STATUS.OK).json(result)
  } catch (error) {
    if (error instanceof Error && (error.message.includes('not found') || 
        error.message.includes('Invalid password') || 
        error.message.includes('Invalid credentials'))) {
      return res.status(HTTP_STATUS.UNATHORIZED).json({ 
        error: 'Invalid email or password '
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
});

// POST /internal/auth/validate
router.post('/validate', async (req, res) => {
  try {
    const {accessToken} = req.body
    if(!accessToken){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          error: 'AccessToken is required' 
        });
    }
    const payload = await authService.validateToken(accessToken)
    
    return res.status(HTTP_STATUS.OK).json(payload)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      return res.status(HTTP_STATUS.UNATHORIZED).json({ 
        error: error.message 
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error:error instanceof Error ? error.message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
});

// POST /internal/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const {refreshToken} = req.body
    if(!refreshToken){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          error: 'RefreshToken is required' 
        });
      }
      const newToken = await authService.processRefreshToken(refreshToken)
 
      return res.status(HTTP_STATUS.OK).json(newToken)
  } catch (error) {
   if (error instanceof Error && (
          error.message.includes('Invalid') ||
          error.message.includes('not found') ||
          error.message.includes('re-use')
        )) {
        return res.status(HTTP_STATUS.UNATHORIZED).json({
          error: error.message
        });
      }
   
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      });
  }
});


// POST /internal/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const {refreshToken} = req.body 
    if(!refreshToken){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({error: 'RefreshToken is required'})
    }
    await authService.handleLogout(refreshToken)

    return res.status(HTTP_STATUS.OK).json({message: 'Logged out'})
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid refresh token')) {
      return res.status(HTTP_STATUS.UNATHORIZED).json({ 
        error: error.message 
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
});

// GET /internal/auth/oauth/initiate
router.get('/oauth/initiate', async (req, res) => {
  try {
    // TODO: Implement OAuth initiation logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: error.message 
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
});

// POST /internal/auth/oauth/exchange-code
router.post('/oauth/exchange-code', async (req, res) => {
  try {
    // TODO: Implement OAuth code exchange logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: error.message 
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
});

export default router;
