import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'

import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutestoHourString } from './utils/convert-minutes-to-hour-string'

const app = express()

app.use(express.json())

app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
})

/**
 *  Query: ...
 *  Route: ...
 *  Body: ...
 */

// localhost:3333/ads
// HTTP methods / API RESful / HTTP Codes

// GET - Front end precisando de informações
// POST - Criar algo no backend
// PUT - Editar entidade por completo
// PATCH - Pequenas edições
// DELETE - Deletar Entidade

app.get('/games', async ( request, response ) => {

    const games = await prisma.game.findMany({
        include:{
           _count:{
            select:{
                ads: true
            }
           }
        }
    })

    return response.json(games);
})
app.post('/games/:gameId/ads', async ( request, response ) => {
    const gameId = request.params.gameId
    const body = request.body


    const ad = await prisma.ad.create({
        data:{
            gameId,            
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })


    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,

        },
        where:{
            gameId,
        },
        orderBy: {
            createAt: 'desc',
        }
    })

    return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutestoHourString(ad.hourStart),
            hourEnd: convertMinutestoHourString(ad.hourEnd),
        }
    }))//Resposta da requisição
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true,
        },
        where:{
            id: adId,
        }
    })
    return response.json({
        discord: ad.discord
    })//Resposta da requisição
})

app.listen(3333)//A aplicação fica ativa, ouvindo novas requisições