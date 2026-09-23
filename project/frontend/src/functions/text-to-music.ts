import {
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    Tensor
} from "@huggingface/transformers";

import { LoadingState } from "../interfaces/loadingState";

class TextToMusic {
    static #instance: TextToMusic;

    private model?: Awaited<
        ReturnType<typeof AutoModelForSeq2SeqLM.from_pretrained>
    >;

    private tokenizer?: Awaited<
        ReturnType<typeof AutoTokenizer.from_pretrained>
    >;

    private constructor() {}

    public static get instance(): TextToMusic {
        if (!TextToMusic.#instance) {
            TextToMusic.#instance = new TextToMusic();
        }

        return TextToMusic.#instance;
    }

    public loadingState: LoadingState = {
        isLoading: false,
    };

    public async loadModel() {
        if (this.model && this.tokenizer) {
            return;
        }

        this.loadingState.isLoading = true;
        this.loadingState.progress = 0;

        this.tokenizer = await AutoTokenizer.from_pretrained(
            "tthoraldson/text-to-music-onnxruntime"
        );

        this.model = await AutoModelForSeq2SeqLM.from_pretrained(
            "tthoraldson/text-to-music-onnxruntime",
            {
                dtype: "fp32",
                revision: "main",

                progress_callback: (progress) => {
                    if (progress.status === "progress") {
                        this.loadingState.progress =
                            Math.round(progress.progress ?? 0);
                    }

                    if (progress.status === "done") {
                        this.loadingState.isLoading = false;
                        this.loadingState.progress = 100;
                    }
                },
            }
        );
    }

public async generateMusic(text: string): Promise<string> {
    // await this.loadModel();

    // if (!this.model || !this.tokenizer) {
    //     throw new Error("Text-to-music model is not loaded.");
    // }

    // const inputs = await this.tokenizer(text);

    // const output = await this.model.generate({
    //     ...inputs,
    //     max_new_tokens: 256,
    // });

    // const outputTensor = output as Tensor;

    // const result = this.tokenizer.decode(
    //     outputTensor,
    //     { skip_special_tokens: true }
    // );

    // console.log("output:", result);

    // return result;
    return "hello"
}
}

export { TextToMusic}