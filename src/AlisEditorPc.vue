<template lang="html">
  <div id="ALISEditor">
    <div class="container" id="editor"></div>
    <InsertButton
      :articleId="articleId"
      :editor="editor"
      v-if="insertButton.isVisible"
      :style="{
        left: `calc(50% - 400px)`,
        top: `${insertButton.posY}px`
      }"
    />
  </div>
</template>

<script>
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import Heading from '@/plugins/ckeditor5/heading/heading'
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import EssentialsPlugin from '@/plugins/ckeditor5/essentials/essentials'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import InsertButton from './components/InsertButton'
import CustomUploadAdapterPlugin from '@/plugins/image/CustomUploadAdapterPlugin'
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave'
import Emptyness from 'ckeditor5-emptyness/src/emptyness'
import MediaEmbed from '@/plugins/ckeditor5/media-embed/mediaembed'
import saveData from '@/utils/saveData'
import iconHeading2 from '@/assets/icons/heading2.svg'
import iconHeading3 from '@/assets/icons/heading3.svg'
import handleKeydownEnter from '@/utils/handleKeydownEnter'
import { providers } from '@/config/editor'

export default {
  props: {
    articleId: {
      type: String
    },
    clientId: {
      type: String
    },
    functions: {
      type: Object
    },
    editorContent: {
      type: String,
      default: null
    },
    iframelyApiKey: {
      type: String
    },
    domain: {
      type: String
    }
  },
  components: {
    InsertButton
  },
  data() {
    return {
      editor: null,
      insertButton: {
        isVisible: false,
        posY: 0
      }
    }
  },
  mounted() {
    // エディタの左側にあるプラスボタンの挙動制御
    document.addEventListener('selectionchange', this.handleSelectionChange)
    // propsを変数にset
    const { articleId, clientId, functions } = this
    BalloonEditor.create(document.querySelector('#editor'), {
      extraPlugins: [CustomUploadAdapterPlugin.bind(null, articleId, clientId, functions)],
      plugins: [
        EssentialsPlugin,
        BoldPlugin,
        ItalicPlugin,
        LinkPlugin,
        Heading,
        HeadingButtonsUI,
        Paragraph,
        BlockQuote,
        Image,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageUpload,
        Autosave,
        Emptyness,
        MediaEmbed
      ],
      toolbar: ['heading2', 'heading3', 'blockQuote', 'bold', 'italic', 'link'],
      autosave: {
        save(editor) {
          return saveData(editor.getData(), articleId, clientId, functions)
        }
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 1',
            class: 'ck-heading_heading2',
            icon: iconHeading2
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 2',
            class: 'ck-heading_heading3',
            icon: iconHeading3
          }
        ]
      },
      image: {
        toolbar: ['imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
        styles: [
          'full',
          { name: 'alignLeft', title: '左寄せ画像' },
          { name: 'alignRight', title: '右寄せ画像' }
        ]
      },
      mediaEmbed: {
        previewsInData: false,
        providers: providers(this.domain, this.iframelyApiKey)
      }
    }).then((editor) => {
      this.editor = editor
      if (this.editorContent !== null) {
        editor.setData(this.editorContent)
      }
      handleKeydownEnter(editor, this.functions.getResourceFromIframely)
      this.removeSaveStatus(editor, functions)
    })
  },
  methods: {
    handleSelectionChange() {
      const selection = window.getSelection()
      const target = selection.anchorNode
      if (target === null || target.nodeName !== 'P') {
        this.insertButton.isVisible = false
        return
      }
      if (target.textContent === '') {
        const rect = target.getBoundingClientRect()
        this.insertButton.posY = rect.top - 13 + window.pageYOffset
        this.insertButton.isVisible = true
      } else {
        this.insertButton.isVisible = false
      }
    },
    focusEditor() {
      // selection をタイトルからエディタに移動し selection の位置を初期化
      this.editor.model.change((writer) => {
        this.editor.editing.view.focus()
        writer.setSelection(null)
      })
    },
    removeSaveStatus(editor, functions) {
      editor.model.document.on('change:data', () => {
        functions.setSaveStatus({ saveStatus: '' })
      })
    }
  },
  beforeDestroy() {
    document.removeEventListener('selectionchange', this.controlButton)
  }
}
</script>

<style lang="scss">
.iframe-twitter {
  position: relative;
  padding-bottom: 140px;

  .twitter-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
.iframe-any {
  position: relative;
  padding-bottom: 140px;

  .any-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}

.iframe-youtube {
  position: relative;
  padding-bottom: 100%;
  height: 0;
  padding-bottom: 56.2493%;
  .youtube-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
</style>
