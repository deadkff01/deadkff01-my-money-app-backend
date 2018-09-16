const BillingCycle = require('./billingCycle')
const errorHandler = require('../commom/errorHandler')

BillingCycle.methods(['get', 'post', 'put', 'delete', 'patch'])

//validando no put as regas do schema
//sempre retornar o objeto na versao nova
BillingCycle.updateOptions({new: true, runValidators: true})

BillingCycle.after('post', errorHandler)
.after('put', errorHandler)

BillingCycle.route('count', (req, res, next) => {
    BillingCycle.countDocuments((error, value) => {
        if(error) {
           res.status(500).json({errors: [error]}) 
        } else {
            res.json({value})
        }
    })
})

BillingCycle.route('summary', (req, res, next) => {
    BillingCycle.aggregate([{
        $project: {
            credit: {
                $sum: "$credits.value"
            }, 
            debt: {
                $sum: "$debts.value"
            }
        }
    }, {
        $group: {
            _id: null, 
            credit: {
                $sum: "$credit"
            }, 
            debt: {
                $sum: "$debt"
            }
        }
    }, {
        $project: {
            _id: 0, 
            credit: 1, 
            debt: 1
        }
    }]).exec((error, result) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || { credit: 0, debt: 0 })
        }
    })
})

module.exports = BillingCycle