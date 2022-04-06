<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Toggle\Manager;
use Sonata\Form\Type\CollectionType;
use Sonata\BlockBundle\Meta\Metadata;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\Form\Validator\ErrorElement;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\Form\Type\DateTimePickerType;
use Capco\AppBundle\Elasticsearch\Indexer;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Symfony\Component\Validator\Constraints\Required;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ProjectAdmin extends CapcoAdmin
{
    protected $classnameLabel = 'project';
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'publishedAt'];

    protected $formOptions = ['cascade_validation' => true];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function validate(ErrorElement $errorElement, $object)
    {
        if (empty($object->getAuthors())) {
            $errorElement
                ->with('Author')
                ->addConstraint(new Required())
                ->addViolation('global.required')
                ->end();
        }
    }

    public function postUpdate($object)
    {
        /** @var Project $object */
        $container = $this->getConfigurationPool()->getContainer();
        if ($container) {
            $elasticsearchDoctrineListener = $container->get(ElasticsearchDoctrineListener::class);
            // Index project
            $elasticsearchDoctrineListener->addToMessageStack($object);

            // Index comments
            $comments =
                $container->get(ProposalCommentRepository::class)->getCommentsByProject($object) ??
                [];
            if (!empty($comments)) {
                array_map(static function ($comment) use ($elasticsearchDoctrineListener) {
                    $elasticsearchDoctrineListener->addToMessageStack($comment);
                }, $comments);
            }

            // Index Votes
            $selectionVotes =
                $container
                    ->get(ProposalSelectionVoteRepository::class)
                    ->getVotesByProject($object) ?? [];
            $collectVotes =
                $container->get(ProposalCollectVoteRepository::class)->getVotesByProject($object) ??
                [];
            $votes = array_merge($collectVotes, $selectionVotes);
            if (!empty($votes)) {
                array_map(static function ($vote) use ($elasticsearchDoctrineListener) {
                    $elasticsearchDoctrineListener->addToMessageStack($vote);
                }, $votes);
            }
        }
        parent::postUpdate($object);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $cover = $object->getCover();
        if ($cover) {
            $provider = $this->getConfigurationPool()
                ->getContainer()
                ->get($cover->getProviderName());
            $format = $provider->getFormatName($cover, 'form');
            $url = $provider->generatePublicUrl($cover, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getExportFormats(): array
    {
        return [];
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('duplicate');
        $collection->clearExcept([ 'delete', 'duplicate']);
        $collection->add('preview', $this->getRouterIdParameter() . '/preview');
    }
}
