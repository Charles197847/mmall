/**
 * Static values live in app.json. This file exists so the EAS project id
 * note sits next to the config.
 *
 * extra.eas.projectId is intentionally empty. From this directory, after
 * `eas login`, run `eas init` and commit the project id it writes.
 * Do not paste a guessed id.
 */
module.exports = ({ config }) => config
