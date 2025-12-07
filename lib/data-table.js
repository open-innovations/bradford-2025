import { encodeHex } from "@std/encoding/hex";

/**
 * Hash a message with a SHA-256
 * @param {string} message The string to be hashed
 * @returns {string} The hashed version of the string
 */
async function hash(message) {
  const messageBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

export class DataTable {
  /**
   * @param {Object.<string, any>[]} data Data table
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * Convert the provided data structure from a "long" to "wide" format.
   * A column is added to the output dataset for each value found in the variable column.
   *
   * The variableField option defaults to "variable".
   * The valueField option defaults to "value".
   *
   * All other columns form the index.
   *
   * If there are multiple values for a variableField entry, the last one wins
   *
   * Index,Variable,Value
   * AAAAA,Min,10
   * AAAAA,Count,1
   * AAAAA,Count,2
   *
   * Would be converted into
   *
   * Index,Min,Count
   * AAAAA,10,2
   *
   * @param {{variableField: string, valueField: string}} options Configuration options
   */
  async recast(options = {}) {
    const config = {
      variableField: "variable",
      valueField: "value",
      ...options,
    };

    const result = {};

    for (const record of this.data) {
      const indexStructure = {};
      let variable, value;
      for (const [k, v] of Object.entries(record)) {
        if (k == config.variableField) {
          variable = v;
        } else if (k == config.valueField) {
          value = v;
        } else {
          indexStructure[k] = v;
        }
      }
      const key = await hash(JSON.stringify(indexStructure));
      result[key] = {
        ...result[key],
        ...indexStructure,
        [variable]: value,
      };
    }
    this.data = Object.values(result);
    return this;
  }

  /**
   * Subselect the fields
   *
   * @param {string[]} fields Fields to include in the result
   */
  cut(...fields) {
    this.data = this.data.map((entry) => {
      for (const field of Object.keys(entry)) {
        if (!fields.includes(field)) delete entry[field];
      }
      return entry;
    });
    return this;
  }
}
