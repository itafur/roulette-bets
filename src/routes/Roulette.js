const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const RouletteModel = require('../models/Roulette')
const BetModel = require('../models/Bet')

router.post('/create', (req, res) => {
    create(req, res)
})

router.put('/open', (req, res) => {
    open(req, res)
})

router.post('/bet', (req, res) => {
    bet(req, res)
})

router.put('/close', (req, res) => {
    close(req, res)
})

router.get('/getAllOpenAndClosed', (req, res) => {
    getAllOpenAndClosed(res)
})

function create(req, res) {
    const newRoulette = new RouletteModel({
        status: 'CREATED',
        createdAt: (new Date())
    })
    newRoulette.save().then(() => {
        res.send({
            response: {
                message: 'La ruleta ha sido creada',
                data: {
                    id: newRoulette._id
                }
            }
        })
    }).catch(err => {
        res.status(501).send({
            response: {
                message: err
            }
        })
    })
}

function open(req, res) {
    const { id } = req.body
    const data = {
        status: 'OPEN',
        openedAt: (new Date())
    }
    RouletteModel.findById({ _id: mongoose.Types.ObjectId(id) }).then((roulette) => {
        if (!roulette) {
            
            return res.status(502).send({
                response: {
                    message: 'La ruleta no existe'
                }
            })
        }
        if (roulette.status && roulette.status === 'OPEN') {
            
            return res.status(502).send({
                response: {
                    message: 'La ruleta ya se encuentra abierta'
                }
            })
        }
        RouletteModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: data }).then(() => {
            res.send({
                response: {
                    message: 'La ruleta ha sido abierta'
                }
            })
        }).catch(err => {
            res.status(501).send({
                response: {
                    message: err
                }
            })
        })
    })
}

function bet(req, res) {
    const { userId } = req.headers['user-id']
    const { rouletteId, betType, betOption } = req.body
    const amountOfMoney = Number(req.body.amountOfMoney)
    RouletteModel.findById({ _id: mongoose.Types.ObjectId(rouletteId) }).then((roulette) => {
        if (!roulette) {

            return res.status(502).send({
                response: {
                    message: 'La ruleta no existe'
                }
            })
        }
        if (roulette.status) {
            if (roulette.status === 'CREATED') {

                return res.status(502).send({
                    response: {
                        message: 'La ruleta no ha sido abierta'
                    }
                })
            } else if (roulette.status === 'CLOSED') {

                return res.status(502).send({
                    response: {
                        message: 'La ruleta se encuentra cerrada'
                    }
                })
            }
        }
        let validate = betValidation({ betType, betOption, amountOfMoney })
        if (!validate.result) {

            return res.status(502).send({
                response: {
                    message: validate.message
                }
            })
        }
        const newBet = new BetModel({
            rouletteId,
            userId,
            createdAt: (new Date()),
            betType,
            betOption,
            amountOfMoney
        })
        newBet.save().then(() => {
            res.send({
                response: {
                    message: 'Apuesta realizada con éxito',
                    data: {
                        id: newBet._id
                    }
                }
            })
        }).catch(err => {
            res.status(501).send({
                response: {
                    message: err
                }
            })
        })
    })
}

function betValidation(betObject) {
    if (betObject.betType !== 'NUMBER' && betObject.betType !== 'COLOR') {
        
        return {
            result: false,
            message: 'Tipo de apuesta desconocida'
        }
    }
    if (betObject.betType === 'NUMBER') {
        if (!betObject.betOption || isNaN(betObject.betOption)) {

            return {
                result: false,
                message: 'El número seleccionado para apostar es inválido'
            }
        }
        let number = Number(betObject.betOption)
        if (number < 0 || number > 36) {
            
            return {
                result: false,
                message: 'El número debe ser entre 0 y 36'
            }
        }
    }
    if (betObject.betType === 'COLOR' && betObject.betOption !== 'BLACK' && betObject.betOption !== 'RED') {

        return {
            result: false,
            message: 'Tipo de color desconocido'
        }
    }
    if (betObject.amountOfMoney <= 0) {
        
        return {
            result: false,
            message: 'La cantidad de dinero a apostar debe ser al menos 1 dolar'
        }
    }
    if (betObject.amountOfMoney > 10000) {
        
        return {
            result: false,
            message: 'La cantidad de dinero a apostar no debe ser superior a 10.000 dolares'
        }
    }
    
    return {
        result: true,
        message: ''
    }
}

function close(req, res) {
    const { id } = req.body
    const data = {
        status: 'CLOSED',
        closedAt: (new Date())
    }
    RouletteModel.findById({ _id: mongoose.Types.ObjectId(id) }).then((roulette) => {
        if (!roulette) {
            
            return res.status(502).send({
                response: {
                    message: 'La ruleta no existe'
                }
            })
        }
        if (roulette.status) {
            if (roulette.status === 'CREATED') {

                return res.status(502).send({
                    response: {
                        message: 'No es posible cerrar la ruleta, debe ser abierta'
                    }
                })
            }
            if (roulette.status === 'CLOSED') {

                return res.status(502).send({
                    response: {
                        message: 'La ruleta ya se encuentra cerrada'
                    }
                })
            }
        }
        RouletteModel.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: data }).then(() => {
            getBetsByRouletteId(id).then((bets) => {
                res.send({
                    response: {
                        message: 'La ruleta ha sido cerrada',
                        results: bets
                    }
                })
            })
        }).catch(err => {
            res.status(501).send({
                response: {
                    message: err
                }
            })
        })
    })
}

function getAllOpenAndClosed(res) {
    RouletteModel.find({ status: { $in: ['OPEN', 'CLOSED'] } }).then((roulettes) => {
        res.send({
            response: {
                message: '',
                results: roulettes
            }
        })
    }).catch(err => {
        res.status(501).send({
            response: {
                message: err
            }
        })
    })
}

function getBetsByRouletteId(rouletteId) {
    return new Promise((resolve, reject) => {
        BetModel.find({ rouletteId }).then((bets) => {
            resolve(bets)
        })
    })
}


module.exports = router