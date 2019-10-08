const { messages } = require('../')

module.exports = {
  valid: [
    `<div className='test' />`,
    `<div className={styles.test} />`,
    `<div {...{ className }} />`,
    `<TestBase className='test' />`,
    `<TestBase className={styles.test} />`,
    `<TestBase {...{ className }} />`,
  ],
  invalid: [
    {
      code: `<Test className='test' />`,
      errors: [{ message: messages['no className'], type: 'JSXAttribute' }]
    },
    {
      code: `<Test className={styles.test} />`,
      errors: [{ message: messages['no className'], type: 'JSXAttribute' }]
    },
    {
      code: `<Test {...{ className }} />`,
      errors: [{ message: messages['no className'], type: 'Property' }]
    }
  ]
}