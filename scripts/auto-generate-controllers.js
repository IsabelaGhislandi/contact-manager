#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Analisa os use cases existentes e gera controllers automaticamente
function scanUseCases() {
  const servicesDir = path.join(__dirname, '..', 'src', 'services')
  const entities = []
  
  // Escanear diretórios de serviços
  const serviceDirs = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'errors' && dirent.name !== 'factories')
  
  serviceDirs.forEach(dir => {
    const entityName = dir.name
    const entityPath = path.join(servicesDir, entityName)
    const files = fs.readdirSync(entityPath)
    
    const useCases = {
      create: files.includes(`create-${entityName.slice(0, -1)}.ts`),
      get: files.includes(`get-${entityName.slice(0, -1)}.ts`),
      list: files.includes(`list-${entityName}.ts`),
      update: files.includes(`update-${entityName.slice(0, -1)}.ts`),
      delete: files.includes(`delete-${entityName.slice(0, -1)}.ts`)
    }
    
    entities.push({ name: entityName, useCases })
  })
  
  return entities
}

function generateControllerForEntity(entityName, useCases) {
  const singular = entityName.slice(0, -1) // remove 's'
  const capitalizedSingular = singular.charAt(0).toUpperCase() + singular.slice(1)
  const capitalizedPlural = entityName.charAt(0).toUpperCase() + entityName.slice(1)
  
  let imports = `import { Body, Controller, Route, Tags, Security, Request`
  let methods = []
  
  if (useCases.create) {
    imports += `, Post, SuccessResponse`
    methods.push(`
  @Post()
  @SuccessResponse('201', '${capitalizedSingular} criado com sucesso')
  public async create${capitalizedSingular}(
    @Body() requestBody: Create${capitalizedSingular}Request,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, ${singular}: ${capitalizedSingular}Response }> {
    const create${capitalizedSingular}UseCase = makeCreate${capitalizedSingular}UseCase()
    
    const result = await create${capitalizedSingular}UseCase.execute({
      userId: request.userId,
      ...requestBody
    })
    
    return {
      message: '${capitalizedSingular} created successfully',
      ${singular}: result.${singular}
    }
  }`)
  }
  
  if (useCases.get) {
    imports += `, Get, Path`
    methods.push(`
  @Get('{id}')
  @SuccessResponse('200', '${capitalizedSingular} encontrado')
  public async get${capitalizedSingular}(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<${capitalizedSingular}Response> {
    const get${capitalizedSingular}UseCase = makeGet${capitalizedSingular}UseCase()
    
    const result = await get${capitalizedSingular}UseCase.execute({
      ${singular}Id: id,
      userId: request.userId
    })
    
    return result.${singular}
  }`)
  }
  
  if (useCases.list) {
    if (!imports.includes('Get')) imports += `, Get`
    methods.push(`
  @Get()
  @SuccessResponse('200', 'Lista de ${entityName}')
  public async list${capitalizedPlural}(
    @Request() request: AuthenticatedRequest
  ): Promise<{ ${entityName}: ${capitalizedSingular}Response[] }> {
    const list${capitalizedPlural}UseCase = makeList${capitalizedPlural}UseCase()
    
    const result = await list${capitalizedPlural}UseCase.execute({
      userId: request.userId
    })
    
    return { ${entityName}: result.${entityName} }
  }`)
  }
  
  if (useCases.update) {
    imports += `, Put`
    methods.push(`
  @Put('{id}')
  @SuccessResponse('200', '${capitalizedSingular} atualizado')
  public async update${capitalizedSingular}(
    @Path() id: string,
    @Body() requestBody: Update${capitalizedSingular}Request,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, ${singular}: ${capitalizedSingular}Response }> {
    const update${capitalizedSingular}UseCase = makeUpdate${capitalizedSingular}UseCase()
    
    const result = await update${capitalizedSingular}UseCase.execute({
      ${singular}Id: id,
      userId: request.userId,
      ...requestBody
    })
    
    return {
      message: '${capitalizedSingular} updated successfully',
      ${singular}: result.${singular}
    }
  }`)
  }
  
  if (useCases.delete) {
    imports += `, Delete`
    methods.push(`
  @Delete('{id}')
  @SuccessResponse('204', '${capitalizedSingular} deletado')
  public async delete${capitalizedSingular}(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<void> {
    const delete${capitalizedSingular}UseCase = makeDelete${capitalizedSingular}UseCase()
    
    await delete${capitalizedSingular}UseCase.execute({
      ${singular}Id: id,
      userId: request.userId
    })
  }`)
  }
  
  imports += ` } from 'tsoa'`
  
  const factoryImports = Object.entries(useCases)
    .filter(([_, exists]) => exists)
    .map(([operation, _]) => {
      const opName = operation.charAt(0).toUpperCase() + operation.slice(1)
      return `import { make${opName}${capitalizedSingular}UseCase } from '../../../services/factories/${entityName}/make-${operation}-${singular}-use-case'`
    }).join('\n')
  
  const controllerContent = `${imports}
${factoryImports}
import { Create${capitalizedSingular}Request, Update${capitalizedSingular}Request, ${capitalizedSingular}Response } from '../../../models'

interface AuthenticatedRequest extends Express.Request {
  userId: string
}

@Route('${entityName}')
@Tags('${capitalizedPlural}')
@Security('jwt')
export class ${capitalizedPlural}Controller extends Controller {${methods.join('')}
}
`

  const outputPath = path.join(__dirname, '..', 'src', 'http', 'controller', entityName, `${capitalizedPlural}Controller.ts`)
  
  // Criar diretório se não existir
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, controllerContent)
  console.log(`✅ Controller gerado: ${outputPath}`)
}

// Gerar automaticamente para todas as entidades
function generateAllControllers() {
  const entities = scanUseCases()
  
  console.log('🔍 Entidades encontradas:', entities.map(e => e.name))
  
  entities.forEach(entity => {
    console.log(`\n🚀 Gerando controller para ${entity.name}...`)
    generateControllerForEntity(entity.name, entity.useCases)
  })
  
  console.log('\n✅ Todos os controllers foram gerados!')
  console.log('🔧 Execute: npm run tsoa:build para gerar a documentação')
}

generateAllControllers()
