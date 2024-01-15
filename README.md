# PharmaCheck

## [Visit the Demo](http://pharma-check.vercel.app/)

![PharmaCheck Banner](https://github.com/notken12/medication-scanner/blob/main/PharmaCheckBanner.png?raw=true)

Built at Hack the Nest 2023 at Tysons, VA by Ken Zhou and Benjamin Habyarimana. Our app lets users scan the Drug Facts label of medicine they are taking/planning to buy to check for potential drug interactions. We used Tesseract.js for OCR, OpenAI GPT-3.5 for text comprehension, and the NIH Drug Interaction API to query drug interactions from a medical database.

# Inspiration
When taking multiple medicines we often worry if they will conflict each other and cause harm. If doctors prescribe a drug without knowing or considering the medications a patient is currently taking, either by mistake or poor communication, there can be serious or even deadly side effects from drug interactions. This inspired us to make an app that lets users scan medicine they’re prescribed or shopping for to automatically check for interactions against the medication they’re taking.

# What it does
The app has a simple interface that lets the user scan a Drug Facts label. The app will analyze the text on the label, find the ingredients, and check for drug interactions with previously scanned medicine using a medical database. The user can also save their allergies in the app, and it will check if the scanned medicine contains any allergens.

# How we built it
We built the UI using SvelteKit and TailwindCSS. We used the User Media API to access the user's camera to take a picture of the Drug Facts label and used Tesseract.js, a computer vision library, to recognize the text. The label text is then sent with a query to OpenAI Chat Completions to identify the name of the medicine and the active ingredients. Finally, the app makes a query with the ingredients to the NIH Drug Interactions API, which checks its database for any drug interactions between the ingredients. Scanned items are saved to the user's computer using the JavaScript Local Storage API, so all information is stored securely on the user's device.

# Challenges we ran into
We faced challenges with the accuracy of the OCR text recognition when the image was blurry or text was misaligned. Programming the querying of the NIH Drug Interactions API was challenging due to having to make two passes of queries, first finding the IDs for each drug and then taking all the IDs and querying for interactions, and finally digesting the complicated JSON response. The CSS styling for making the scanner view responsive based on device size was also difficult.

# Accomplishments that we're proud of
We're proud of the simplicity and ease of use of our app, the complex technical processes it uses to serve the user, and the UX decisions we made to make the app as safe as possible. For example, as soon a medication is scanned, it is recorded without needing confirmation, and the app compares against all recently scanned items. This makes it so it will check any drugs that the user even potentially is taking, not just ones that they confirmed. This was our first time using multiple types of AI together in an app, and we're happy how it turned out.

# What we learned
We learned how to chain multiple AI APIs together and use the JavaScript camera APIs to build an app. We also learned about the importance of checking for drug interactions before using medication and the data sources and research involved in drug interactions.

# What's next for PharmaCheck
We plan to fully implement the allergy checking feature, allow for data import/export between devices or cloud syncing, and implement push notification reminders and potential overdosage alerts based on the suggested dosage period on the label.
