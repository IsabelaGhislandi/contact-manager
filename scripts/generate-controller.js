#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function generateController(entityName) {
  const controllerTemplate = `import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, SuccessResponse, Tags, Request } from 'tsoa'
import { Create${entityName}Request, Update${entityName}Request, ${entityName}Response } from '../../../models'
import { make${entityName}UseCases } from '../../../services/factories/${entityName.toLowerCase()}s'

interface AuthenticatedRequest extends Express.Request {
  userId: string
}

@Route('${entityName.toLowerCase()}s')
@Tags('${entityName}s')
@Security('jwt')
export class ${entityName}sController extends Controller {
  
  @Post()
  @SuccessResponse('201', '${entityName} criado com sucesso')
  public async create${entityName}(
    @Body() requestBody: Create${entityName}Request,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, ${entityName.toLowerCase()}: ${entityName}Response }> {
    const create${entityName}UseCase = make${entityName}UseCases().create
    
    const result = await create${entityName}UseCase.execute({
      userId: request.userId,
      ...requestBody
    })
    
    return {
      message: '${entityName} created successfully',
      ${entityName.toLowerCase()}: result.${entityName.toLowerCase()}
    }
  }

  @Get('{id}')
  @SuccessResponse('200', '${entityName} encontrado')
  public async get${entityName}(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<${entityName}Response> {
    const get${entityName}UseCase = make${entityName}UseCases().get
    
    const result = await get${entityName}UseCase.execute({
      ${entityName.toLowerCase()}Id: id,
      userId: request.userId
    })
    
    return result.${entityName.toLowerCase()}
  }

  @Get()
  @SuccessResponse('200', 'Lista de ${entityName.toLowerCase()}s')
  public async list${entityName}s(
    @Request() request: AuthenticatedRequest
  ): Promise<{ ${entityName.toLowerCase()}s: ${entityName}Response[] }> {
    const list${entityName}sUseCase = make${entityName}UseCases().list
    
    const result = await list${entityName}sUseCase.execute({
      userId: request.userId
    })
    
    return { ${entityName.toLowerCase()}s: result.${entityName.toLowerCase()}s }
  }

  @Put('{id}')
  @SuccessResponse('200', '${entityName} atualizado')
  public async update${entityName}(
    @Path() id: string,
    @Body() requestBody: Update${entityName}Request,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, ${entityName.toLowerCase()}: ${entityName}Response }> {
    const update${entityName}UseCase = make${entityName}UseCases().update
    
    const result = await update${entityName}UseCase.execute({
      ${entityName.toLowerCase()}Id: id,
      userId: request.userId,
      ...requestBody
    })
    
    return {
      message: '${entityName} updated successfully',
      ${entityName.toLowerCase()}: result.${entityName.toLowerCase()}
    }
  }

  @Delete('{id}')
  @SuccessResponse('204', '${entityName} deletado')
  public async delete${entityName}(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<void> {
    const delete${entityName}UseCase = make${entityName}UseCases().delete
    
    await delete${entityName}UseCase.execute({
      ${entityName.toLowerCase()}Id: id,
      userId: request.userId
    })
  }
}
`

  const outputPath = path.join(__dirname, '..', 'src', 'http', 'controller', entityName.toLowerCase() + 's', `${entityName}sController.ts`)
  
  // Criar diretório se não existir
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, controllerTemplate)
  console.log(`✅ Controller gerado: ${outputPath}`)
}

// Uso: node scripts/generate-controller.js Contact
const entityName = process.argv[2]
if (!entityName) {
  console.error('❌ Uso: node scripts/generate-controller.js <EntityName>')
  process.exit(1)
}

generateController(entityName)
