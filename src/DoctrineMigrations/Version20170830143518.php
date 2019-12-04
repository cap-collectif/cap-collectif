<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Cocur\Slugify\Slugify;

class Version20170830143518 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $proposals = $this->connection->fetchAll('SELECT * FROM proposal');
        $slugify = new Slugify();
        foreach ($proposals as $proposal) {
            if ($proposal['answer_id']) {
                $answer = $this->connection->fetchAll(
                    'SELECT * from answer where answer.id = ' . $proposal['answer_id']
                )[0];
                if (!$answer['title']) {
                    $answer['title'] = 'Réponse officielle';
                }
                $news = [
                    'title' => $answer['title'],
                    'body' => $answer['body'],
                    'slug' => $slugify->slugify($answer['title']),
                    'is_published' => true,
                    'published_at' => $answer['created_at'],
                    'created_at' => $answer['created_at'],
                    'updated_at' => $answer['updated_at'],
                    'is_commentable' => true,
                    'dislayed_on_blog' => false,
                ];
                $this->connection->insert('blog_post', $news);
                $postId = $this->connection->lastInsertId();
                $this->connection->insert('blog_post_authors', [
                    'post_id' => $postId,
                    'user_id' => $answer['author_id'],
                ]);
                $this->connection->insert('proposal_post', [
                    'post_id' => $postId,
                    'proposal_id' => $proposal['id'],
                ]);
                $this->connection->delete('answer', array('id' => $answer['id']));
            }
        }
    }

    public function down(Schema $schema): void
    {
    }
}
