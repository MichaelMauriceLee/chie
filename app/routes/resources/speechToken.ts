// import axios from 'axios';

// const tokenUrl = `https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

// const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
//   const { data } = await axios.post(tokenUrl, null, {
//     headers: {
//       'Ocp-Apim-Subscription-Key': process.env.SPEECH_KEY,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//   });
//   context.res = {
//     body: { token: data, region: process.env.SPEECH_REGION },
//   };
// };
