🇫🇷 <a id="elasticsearch"></a> Elasticsearch
------

[⬅️](../README.md) Retour

#### Sommaire :
1. [Les fichiers de config à connaitre](#config)
2. [Les commandes utiles](#commandes)
3. [Rendre une entité indexable](#entities)


### <a id="config"></a> Les fichiers de config à connaitre

Le dossier [src/Capco/AppBundle/Elasticsearch](../src/Capco/AppBundle/Elasticsearch)

Le fichier de [mapping](../src/Capco/AppBundle/Elasticsearch/mapping.yaml)

Les Normalizers [src/Capco/AppBundle/Normalizer](../src/Capco/AppBundle/Normalizer) servent à formatter les donnés à l'indexation. Utile principalement en cas de transformation de donné spécifiquement fait à ce moment

Exemple :
```php
<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\Search\VoteSearch;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class DebateArgumentNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;

    private const GROUP = 'ElasticsearchDebateArgument';

    private ObjectNormalizer $normalizer;
    private VoteSearch $voteSearch;

    public function __construct(ObjectNormalizer $normalizer, VoteSearch $voteSearch)
    {
        $this->normalizer = $normalizer;
        $this->voteSearch = $voteSearch;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array(self::GROUP, $context['groups'])) {
            $data['votesCount'] = $this->voteSearch
                ->searchDebateArgumentVotes($object, 100)
                ->getTotalCount();
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof DebateArgumentInterface;
    }
}

```

### <a id="commandes"></a> Les commandes utiles

Creéer un nouvel index : `capco:es:create`

Indexer : `capco:es:pop`

### <a id="entities"></a> Rendre une entité indexable 

Lui faire implémenter `IndexableInterface`
```php
class Post implements IndexableInterface
{
    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 2;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'post';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch', 'ElasticsearchNestedAuthor'];
    }
}
```

