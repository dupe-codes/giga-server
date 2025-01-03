import cors from "cors"
import express, { Express, Router, Response, Request } from "express"
import path from 'path'

/**
* configure server
*/
const server: Express = express()
const PORT: string | number = process.env.PORT || 4000

server.use(cors())
server.use(express.static(path.join(__dirname, '../client')))

/**
* set up API routes
*/
const router: Router = Router()

const hello = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ "message": "hello, world!" })
}

router.get("/hello", hello)

router.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

server.use(router)

/**
* start server
*/
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
)
