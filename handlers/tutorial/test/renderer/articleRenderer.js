const app = require('app');

const ArticleRenderer = require('../../renderer/articleRenderer');
const mongoose = require('lib/mongoose');
const Article = require('../../models/article');

describe("ArticleRenderer", function() {

  beforeEach(function* () {
    yield Article.destroy();
  });

  it("appends -2, -3... to header with same title", function* () {

    const article = new Article({
      title:   "Title",
      slug:    "test",
      githubLink: 'http://not.exists.com',
      content: "# Title\n\n## Title\n\nMy html *string*."
    });
    const renderer = new ArticleRenderer();

    const result = yield renderer.render(article);
    result.content.replace(/\n/g, '').should.be.eql(
      '<h2><a class="main__anchor" name="title-2" href="#title-2">Title</a></h2><p>My html <em>string</em>.</p>'
    );

  });

  it("resolves references to article", function* () {

    yield new Article({
      title:   "Title",
      slug:    "test",
      weight:  0,
      isFolder: false,
      content: "# Title\n\n## Title\n\nMy html *string*.",
      githubLink: 'http://not.exists.com'
    }).persist();

    const article = new Article({
      title:   "Title",
      slug:    "test",
      weight:  0,
      isFolder: false,
      content: "# Title\n\n[](/test)",
      githubLink: 'http://not.exists.com'
    });

    const renderer = new ArticleRenderer();

    const result = yield renderer.render(article);
    result.content.replace(/\n/g, '').should.be.eql(
      '<p><a href="/test">Title</a></p>'
    );

  });
});
