<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;

class Version20161219175116 extends IdToUuidMigration
{
    public function __construct()
    {
        $this->table = 'fos_user';
        $this->fkTables = [
          ['table' => 'proposal', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
          ['table' => 'proposal', 'key' => 'update_author_id', 'tmpKey' => 'update_author_uuid', 'nullable'=> true],
          ['table' => 'user_favorite_proposal', 'pk'=> ['proposal_id', 'user_id'], 'key' => 'user_id', 'tmpKey'=> 'user_uuid', 'nullable'=> false],
          ['table' => 'theme', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'comment', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'reporting', 'key' => 'reporter_id', 'tmpKey' => 'reporter_uuid', 'nullable'=> true],
          ['table' => 'answer', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
          ['table' => 'opinion', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'opinion_version', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'idea', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'argument', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'source', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
          ['table' => 'reply', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'project', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'event', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'blog_post_authors', 'pk'=> ['post_id', 'user_id'], 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> false],
          ['table' => 'event_registration', 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> true],
          ['table' => 'synthesis_element', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'video', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
          ['table' => 'votes', 'key' => 'voter_id', 'tmpKey' => 'voter_uuid', 'nullable'=> true],
          ['table' => 'fos_user_user_group', 'pk'=> ['group_id', 'user_id'], 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> false],
        ];
    }

    public function down(Schema $schema)
    {
    }
}
