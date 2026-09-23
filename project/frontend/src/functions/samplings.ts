// This is a reimplementation of the pip library "samplings", found here: https://pypi.org/project/samplings/
// I'm only implementing the functions that are needed to make my onnxruntime port of text-to-music work.
import { numpy as np, random, DType } from '@jax-js/jax';


function getSeed(seed: Boolean) {
    if (seed) {
        random.key(42);
    } else {
        random.key(Date.now());
    }
}


function buildMask(lenProbs: number, tokens: np.Array) {
  let mask = np.zeros([length], { dtype: np.DType.Bool });

  if (tokens.size !== 0) {
      const indices = np.arange(length);

    return np.any(indices.reshape([length, 1]).equal(tokens.reshape([1, -1])), 1);
  }

  return mask;
}

function randomSampling(probs: np.ArrayLike, seed=false) {
    // implemented without a seed param, as I couldn't figure out how to make a consistent seed
    // in javascript. I'll use the RNG key instead
    return getSeed(seed=seed);
}

function topPSampling(probs: np.Array, top_p: number, return_probs=false, seed=false) {
    // implemented without a seed param, as I couldn't figure out how to make a consistent seed
    // in javascript

    // Same reference as what's in the samplings library: 
    // Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes, Yejin Choi: 
    // ["The Curious Case of Neural Text Degeneration"](https://arxiv.org/pdf/1904.09751.pdf). ICLR 2020

    if (0 < top_p && top_p < 1) {
        // Sort probability distribution
        const sorted_probs = np.flip(np.sort(probs));
        const sorted_tokens = np.flip(np.argsort(probs));
        const cumulative_probs = np.cumsum(sorted_probs);
        var sorted_tokens_to_remove = np.greater(cumulative_probs, top_p);

        // Logical right shift
        sorted_tokens_to_remove = np.concatenate([
            np.array([false]),
            sorted_tokens_to_remove.slice(0, -1),
        ]);

        // Remove tokens with small probabilities
        const tokensToRemove = np.where(sorted_tokens_to_remove, 1, 0);
        let mask = buildMask(probs.size, tokensToRemove);
        probs = np.where(mask, probs, 0);
        probs = probs.div(np.sum(probs));
    }

    if (return_probs) {
        return probs;
    }
    else {
        return randomSampling(probs, seed=seed);
    }
}

function temperatureSampling(probs: np.Array, temperature: number, weights=1, tempered_tokens= np.array([], { dtype: np.DType.Int32 }), seed=false, return_probs=false) {
    // Same references as what's in the sampling library:
    // - David H. Ackley, Geoffrey E. Hinton, Terrence J. Sejnowski: 
    // ["A Learning Algorithm for Boltzmann Machines"](https://onlinelibrary.wiley.com/doi/pdfdirect/10.1207/s15516709cog0901_7). Cogn. Sci. 9(1): 147-169 (1985)
    // - Nitish Shirish Keskar, Bryan McCann, Lav R. Varshney, Caiming Xiong, Richard Socher: 
    // ["CTRL: A Conditional Transformer Language Model for Controllable Generation"](https://arxiv.org/pdf/1909.05858.pdf). CoRR abs/1909.05858 (2019)

    if (temperature != 1) {
        if (tempered_tokens.size === 0) {
            let tempered_tokens = np.arange(probs.size);
        }

         let modified_mask = buildMask(probs.size, tempered_tokens);
         let modified_sum = np.dot(probs, modified_mask);

        // Divide log probability by the temperature before softmax
        probs = np.where(modified_mask, probs.div(modified_sum), probs);
        probs = np.where(modified_mask, np.log(probs).mul(np.array(weights)).div(temperature), probs);
        probs = np.where(modified_mask, modified_sum.mul(np.exp(probs)).div(np.sum(np.where(modified_mask, np.exp(probs), 0))), probs);
    }

        if (return_probs) {
        return probs;
    }
    else {
        return randomSampling(probs, seed=seed);
    }
}

export { topPSampling, temperatureSampling }