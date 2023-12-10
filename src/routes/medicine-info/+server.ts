import { error, json } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function GET(reqEvent) {
	const drugLabelText = reqEvent.url.searchParams.get('text');
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content:
					'You are a helpful assistant designed to read the text of the Drug Facts section of a medicine label and output JSON containing information about the medicine.'
			},
			{
				role: 'user',
				content: `What is the name of this medicine and the active ingredients? Output JSON with fields "name" and "ingredients". Label text: "${drugLabelText}"`
			}
		],
		model: 'gpt-3.5-turbo-1106',
		response_format: { type: 'json_object' }
	});
	const medicineInfoJson = completion.choices[0].message.content;
	if (medicineInfoJson == null) return;
	const medicineInfo = JSON.parse(medicineInfoJson);

	return json(medicineInfo);
}
