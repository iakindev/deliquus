import { cosmiconfig } from 'cosmiconfig';
import c from 'chalk';
import glob from 'glob';
import Context from './helpers/context';
import crash from './helpers/crash';
import isUndefinedOrEmpty from './helpers/isUndefinedOrEmpty';
import removeExtensions from './helpers/removeExtensions';
import areArraysEqual from './helpers/areArraysEqual';
import debug from './helpers/debug';
import removePath from './helpers/removePath';
import getDistinctArrayValues from './helpers/getDistinctArrayValues';

const main = async () => {
  let context = null;
  console.log(c.cyan('Deliquus Project'));

  try {
    const explorer = await cosmiconfig('deliquus').search();
    if (!explorer) {
      throw new Error('No config found');
    }

    context = new Context(explorer);
  } catch (error) {
    crash(error);
  }

  if (!context?.explorer) return;
  const { sources, targets } = context.explorer.config;
  debug(c.cyan('config:'), { sources, targets });

  if (isUndefinedOrEmpty(sources)) crash('No source found');
  if (isUndefinedOrEmpty(targets)) crash('No target found');

  const sourcesFilenames = glob.sync(sources[0].pattern, { nodir: true });
  debug("Sources' filenames:", sourcesFilenames);
  const targetsFilenames = glob.sync(targets[0].pattern, { nodir: true });
  debug("Targets' filenames:", targetsFilenames);

  const sourcesFilenamesWoExtensions = removeExtensions(sourcesFilenames);
  debug('Sources filenames w/o extensions:', sourcesFilenamesWoExtensions);

  const targetsFilenamesWoExtensions = removeExtensions(targetsFilenames);
  debug('Targets filenames w/o extensions:', targetsFilenamesWoExtensions);

  const sourcesWithRemovedPaths = removePath(sourcesFilenamesWoExtensions);
  debug('Sources with removed paths:', sourcesWithRemovedPaths);
  const targetsWithRemovedPaths = removePath(targetsFilenamesWoExtensions);
  debug('Targets with removed paths:', targetsWithRemovedPaths);

  if (!areArraysEqual(sourcesWithRemovedPaths, targetsWithRemovedPaths))
    crash(
      `Missing Files: ${getDistinctArrayValues(sourcesWithRemovedPaths, targetsWithRemovedPaths)}`,
    );

  console.log(c.bold.green('All OK!'));
};

main();