/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Backend linter configuration.
 * 
 * English: Backend linter configuration.
 * Hindi: बैकएंड लिंटर कॉन्फ़िगरेशन।
 * Hinglish: Backend linter configuration.
 * Marathi: बॅकएंड लिंटर कॉन्फिगरेशन.
 * Gujarati: બેકએન્ડ લિન્ટર ગોઠવણી.
 * Telugu: బ్యాకెండ్ లింటర్ కాన్ఫిగరేషన్.
 * Tamil: பின்தள லிண்டர் கட்டமைப்பு.
 * Kannada: ಬ್ಯಾಕೆಂಡ್ ಲಿಂಟರ್ ಕಾನ್ಫಿಗರೇಶನ್.
 * Malayalam: ബാക്കെൻഡ് ലിന്റർ കോൺഫിഗറേഷൻ.
 * Bengali: ব্যাকএন্ড লিন্টার কনফিগারেশন।
 * Punjabi: ਬੈਕਐਂਡ ਲਿੰਟਰ ਸੰਰਚਨਾ।
 * Odia: ବ୍ୟାକଏଣ୍ଡ୍ ଲିଣ୍ଟର କନଫିଗରେସନ୍।
 * Assamese: বেকএণ্ড লিণ্টাৰ কনফিগাৰেচন।
 * Urdu: بیک اینڈ لنٹر کنفیگریشن۔
 * Bhojpuri: बैकएंड लिंटर कॉन्फ़िगरेशन।
 *
 * SYSTEM COLORS REFERENCE:
 * Primary: #2563EB | Black: #111111 | White: #FFFFFF | Success: #16A34A | Emergency: #DC2626
 */

module.exports = {
  env: {
    es6: true,
    node: true, // Strictly resolves no-undef for module, require, process, exports
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "no-unused-vars": "warn"
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};