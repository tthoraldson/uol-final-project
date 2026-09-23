

class BasicPitchModel {
    static #instance: BasicPitchModel;

    private constructor () { }

    // Followed typescript singleton pattern from here: https://refactoring.guru/design-patterns/singleton/typescript/example
    public static get instance(): BasicPitchModel {
        if (!BasicPitchModel.#instance) {
            BasicPitchModel.#instance = new BasicPitchModel();
        }

        return BasicPitchModel.#instance;
    }

    public runBasicPitch() {
        console.warn('Hello from basic pitch');
    }
}

export { BasicPitchModel }