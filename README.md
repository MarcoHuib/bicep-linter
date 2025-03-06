# Bicep Hungarian Linter  

A **VS Code Extension** that performs linting on **Bicep files** and warns about:  

- Incorrect **section order**  
- **Naming issues** (missing prefixes)  
- **Untyped objects and arrays**  

## 📦 Installation  

### 1. Manual Installation  

1. Clone this repository:  
   ```sh  
   git clone https://github.com/MarcoHuib/bicep-hungarian-linter.git  
   ```  
2. Open the folder in VS Code.  
3. Install dependencies:  
   ```sh  
   npm install  
   ```  
4. Build the extension:  
   ```sh  
   npm run build  
   ```  
5. Package the extension for installation:  
   ```sh  
   npx vsce package  
   ```  
6. Install the packaged `.vsix` file:  
   ```sh  
   code --install-extension <your-extension>.vsix  
   ```  

### 2. Install via VS Code Marketplace *(Coming Soon)*  

This extension is not yet available on the VS Code Marketplace but will be in the future. In the meantime, you can install it manually using the steps above.  

## 🚀 Features  

- **Linting for Bicep files** as they are opened or modified.  
- **Clear error messages** with references to the exact line.  
- **Support for multiple languages** *(Dutch and English)*.  
- **Unit-testable architecture** for easy maintenance.  

## 🛠 Configuration  

The default language is **Dutch**. Want to change the language?  

1. Open `src/extension.ts`.  
2. Modify the language setting:  
   ```typescript  
   let language: Language = 'nl'; // Change 'nl' to 'en' for English  
   ```  

## 🧪 Unit Tests  

Unit tests are included in the `src/test/extension.test.ts` file and use **Mocha** and **Assert** for validation. To run the tests, execute:  
   ```sh  
   npm test  
   ```  

The test suite includes:  
- Detection of **incorrect section order**  
- Detection of **missing prefixes**  
- Detection of **untyped objects**  
- Ensuring no errors occur for correctly formatted code  

## 📜 Contributing  

Want to contribute? Great!  

1. Fork this repository.  
2. Create a feature branch:  
   ```sh  
   git checkout -b my-feature  
   ```  
3. Commit changes:  
   ```sh  
   git commit -m "My update"  
   ```  
4. Push to GitHub:  
   ```sh  
   git push origin my-feature  
   ```  
5. Open a **Pull Request** 🚀  

## 📝 License  

This extension is licensed under the **MIT License**. See `LICENSE` for details.  

---  

✨ Happy linting your Bicep files! 🚀  
