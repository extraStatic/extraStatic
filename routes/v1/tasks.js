const router = require('express').Router({ mergeParams: true })
const asyncHandler = require('express-async-handler')

const Stapsher = require('../../libs/Stapsher')
const { akismetVerify } = require('../../libs/Akismet')
const { incrementEntryCountCache } = require('../../libs/lowdb/actions')

router.post(
  '/new',
  asyncHandler(async (req, res, next) => {
    try {
      let stapsher = new Stapsher(req.params)

      await stapsher.authenticate()

      stapsher.addInfo({
        clientIP: req.ip,
        clientUserAgent: req.get('user-agent'),
        clientReferrer: req.get('referrer'),
        recaptchaResponse: req.body['g-recaptcha-response']
      })

      let { fields, options } = req.body

      let { redirect, ...result } = await stapsher.processNewEntry(
        fields,
        options
      )

      if (redirect) res.redirect(307, redirect)
      else res.send(result)

      incrementEntryCountCache()
    } catch (err) {
      throw err
    }
  })
)

router.get(
  '/verify/akismet',
  asyncHandler(async (req, res, next) => {
    try {
      let stapsher = new Stapsher(req.params)

      await stapsher.authenticate()

      let config = await stapsher.getConfig()

      let enabled = config.get('akismet.enable')

      if (enabled) {
        let validAPIKey = await akismetVerify(
          config.get('akismet.apiKey'),
          config.get('akismet.siteUrl')
        )

        return res.send({ enabled, validAPIKey })
      } else {
        return res.send({ enabled })
      }
    } catch (err) {
      throw err
    }
  })
)

module.exports = router
