import { Body, Controller, Post, Route, SuccessResponse, Tags } from 'tsoa'
import { CreateUserRequest, LoginRequest, UserResponse, LoginResponse } from '../../../models'
import { makeRegisterUseCase } from '../../../services/factories/contacts/make-register-use-case'
import { makeAuthenticateUseCase } from '../../../services/factories/users/make-authenticate-use-case'
import { env } from '../../../env'
import jwt from 'jsonwebtoken'

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
  
  @Post()
  @SuccessResponse('201', 'Usuário criado com sucesso')
  public async createUser(
    @Body() requestBody: CreateUserRequest
  ): Promise<{ message: string, user: UserResponse }> {
    const registerUseCase = makeRegisterUseCase()
    
    const user = await registerUseCase.execute({
      name: requestBody.name,
      email: requestBody.email,
      password: requestBody.password
    })
    
    return {
      message: 'User created successfully',
      user
    }
  }
}

@Route('sessions')
@Tags('Authentication')
export class AuthController extends Controller {
  
  @Post()
  @SuccessResponse('200', 'Login realizado com sucesso')
  public async login(
    @Body() requestBody: LoginRequest
  ): Promise<LoginResponse> {
    const authenticateUseCase = makeAuthenticateUseCase()
    
    const { user } = await authenticateUseCase.execute({
      email: requestBody.email,
      password: requestBody.password
    })
    
    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: '7d'
    })
    
    return {
      message: 'Authentication successful',
      token,
      user
    }
  }
}