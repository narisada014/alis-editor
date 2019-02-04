import axios from 'axios'

export default class CustomUploadAdapter {
  constructor(loader, articleId, clientId, functions) {
    this.loader = loader
    this.articleId = articleId
    this.clientId = clientId
    this.getUserSession = functions.getUserSession
  }

  async upload() {
    const file = this.loader.file
    const fileType = file.type.split('image/')[1].toLowerCase()
    await this.getUserSession()
    const currentUser = localStorage.getItem(
      `CognitoIdentityServiceProvider.${this.clientId}.LastAuthUser`
    )
    const token = localStorage.getItem(
      `CognitoIdentityServiceProvider.${this.clientId}.${currentUser}.idToken`
    )
    const config = {
      headers: {
        Authorization: token,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      params: {
        upload_image_size: file.size,
        upload_image_extension: fileType
      }
    }
    const MAX_UPLOAD = 10 * 1024 * 1024 // 10 MB
    return new Promise(async (resolve, reject) => {
      try {
        if (file.size > MAX_UPLOAD) {
          throw new Error('画像は10MBまでアップロード可能です')
        }
        const getResponse = await axios.get(
          `/api/me/articles/${this.articleId}/image_upload_url`,
          config
        )
        const putResponse = await axios.put(getResponse.data.upload_url, file, {
          headers: { 'Content-Type': fileType }
        })
        const responseData = { ...putResponse.config.data }
        responseData.default = getResponse.data.show_url
        resolve(responseData)
      } catch (error) {
        reject(error)
      }
    })
  }

  abort() {}
}
