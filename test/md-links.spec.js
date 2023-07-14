const path = require('path');
const mdLinks = require('../md-links');

describe('mdLinks', () => {
  it('should return an array of links without validation', () => {
    const pathFile = path.resolve('./test/files/test.md');
    return mdLinks('./test/files/test.md')
      .then(links => {
        expect(links).toEqual([
          {
            href: 'https://github.com',
            text: 'GitHub',
            file: pathFile
          },
          {
            href: 'https://google.com',
            text: 'Google',
            file: pathFile
          },
          {
            href: 'http://www.facebook.com',
            text: 'Facebook',
            file: pathFile
          }
        ]);
      });
  });

  it('should return an array of links with validation', () => {
    const pathFile = path.resolve('./test/files/test.md');
    return mdLinks('./test/files/test.md', { validate: true })
      .then(links => {
        expect(links).toEqual([
          {
            href: 'https://github.com',
            text: 'GitHub',
            file: pathFile,
            status: 200,
            ok: 'ok'
          },
          {
            href: 'https://google.com',
            text: 'Google',
            file: pathFile,
            status: 200,
            ok: 'ok'
          },
          {
            href: 'http://www.facebook.com',
            text: 'Facebook',
            file: pathFile,
            status: 200,
            ok: 'ok'
          }
        ]);
      });
  });

  it('should return an array of links with validation of markdown file with broken links', () => {
    const pathFile = path.resolve('./test/files/test2.md');
    return mdLinks('./test/files/test2.md', { validate: true })
      .then(links => {
        expect(links).toEqual([
          {
            href: 'https://link-roto.com',
            text: 'Link Roto',
            file: pathFile,
            status: 404,
            ok: 'fail'
          }
        ]);
      });
  });

  it('should handle non-existent file', () => {
    return mdLinks('./test/test3.md')
      .catch(error => {
        expect(error.code).toBe('ENOENT');
      });
  });
});
