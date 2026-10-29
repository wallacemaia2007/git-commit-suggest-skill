export const options = [
  { key: "language", type: "select", label: "Idioma", description: "Idioma do assunto e dos detalhes.", group: "Geral", default: "en", choices: ["en", "pt-BR", "es", "fr", "it", "de"] },
  { key: "maxSubjectLength", type: "number", label: "Tamanho máximo do assunto", description: "Limite de caracteres da primeira linha.", group: "Formato", default: 72, min: 40, max: 100 },
  { key: "detailCount.min", type: "number", label: "Mínimo de detalhes", description: "Quantidade mínima de bullets.", group: "Formato", default: 2, min: 1, max: 10 },
  { key: "detailCount.max", type: "number", label: "Máximo de detalhes", description: "Quantidade máxima de bullets.", group: "Formato", default: 4, min: 1, max: 10 },
  { key: "bodySeparator", type: "select", label: "Separador do corpo", description: "Separação entre assunto e detalhes.", group: "Formato", default: "blank", choices: ["blank", "dash"] },
  { key: "scope.allow", type: "confirm", label: "Permitir scope", description: "Permite um scope no assunto.", group: "Estilo", default: true },
  { key: "scope.autoDetect", type: "confirm", label: "Detectar scope automaticamente", description: "Infere o scope a partir dos arquivos alterados.", group: "Estilo", default: true },
  { key: "imperativeMood", type: "confirm", label: "Usar modo imperativo", description: "Prefere verbos no modo imperativo.", group: "Estilo", default: true }
];

export const getValue = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);
export function setValue(object, key, value) {
  const parts = key.split(".");
  let target = object;
  for (const part of parts.slice(0, -1)) target = target[part] ??= {};
  target[parts.at(-1)] = value;
}
export function getDefaultConfig() {
  const config = { configVersion: 1 };
  for (const option of options) setValue(config, option.key, option.default);
  return config;
}
export function validateConfig(input) {
  const config = getDefaultConfig();
  const errors = [];
  for (const option of options) {
    const value = getValue(input ?? {}, option.key);
    if (value === undefined) continue;
    let valid = typeof value === (option.type === "number" ? "number" : option.type === "confirm" ? "boolean" : "string");
    if (option.type === "number") valid &&= Number.isInteger(value) && value >= option.min && value <= option.max;
    if (option.choices) valid &&= option.choices.includes(value);
    if (valid) setValue(config, option.key, value);
    else errors.push({ key: option.key, value });
  }
  const min = getValue(config, "detailCount.min");
  const max = getValue(config, "detailCount.max");
  if (min > max) {
    errors.push({ key: "detailCount", value: { min, max } });
    setValue(config, "detailCount.min", 2);
    setValue(config, "detailCount.max", 4);
  }
  return { config, errors };
}
