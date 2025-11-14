/* eslint-env jest */
const Jimp = require('jimp')

// Media is not part of Node interface
const CropMediaMutation = /* GraphQL */ `
  mutation cropMediaMutation($input: CropMediaInput!) {
    cropMedia(input: $input) {
      media {
        url(format: "cropped_media")
      }
    }
  }
`

describe('Crop Media', () => {
  it('it fetches the url of the cropped media', async () => {
    const mediaId = 'gymnase'
    const cropMediaResponse = await graphql(
      CropMediaMutation,
      {
        input: {
          mediaId: mediaId,
          filters: {
            size: {
              width: 150,
              height: 200,
            },
            start: {
              x: 40,
              y: 160,
            },
          },
        },
      },
      'internal_admin',
    )
    return Jimp.read(cropMediaResponse.cropMedia.media.url).then(image => {
      expect(image.bitmap.width).toBe(150)
      expect(image.bitmap.height).toBe(200)
    })
  })
})
