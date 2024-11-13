<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\FieldDescription\FieldDescriptionCollection;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'proposal';
    protected array $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];
    private TokenStorageInterface $tokenStorage;
    private Indexer $indexer;
    private ElasticsearchDoctrineListener $elasticsearchDoctrineListener;
    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        Indexer $indexer,
        ElasticsearchDoctrineListener $elasticsearchDoctrineListener,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->indexer = $indexer;
        $this->elasticsearchDoctrineListener = $elasticsearchDoctrineListener;
        $this->entityManager = $entityManager;
    }

    public function preRemove($object): void
    {
        $this->indexer->remove(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preRemove($object);
    }

    public function postUpdate($object): void
    {
        // @var Proposal $object

        // Index Proposal
        $this->elasticsearchDoctrineListener->addToMessageStack($object);

        // Index Comments
        $comments = $object->getComments();
        if (null !== $comments) {
            array_map(function ($comment) {
                $this->elasticsearchDoctrineListener->addToMessageStack($comment);
            }, $comments->toArray());
        }

        // Index votes
        $collectVotes = $object->getCollectVotes()->toArray();
        $selectionVotes = $object->getSelectionVotes()->toArray();
        $votes = array_merge($collectVotes, $selectionVotes);
        if (!empty($votes)) {
            array_map(function ($vote) {
                $this->elasticsearchDoctrineListener->addToMessageStack($vote);
            }, $votes);
        }

        parent::postUpdate($object);
    }

    public function getList(): FieldDescriptionCollection
    {
        // Remove APC Cache for soft delete
        $this->entityManager
            ->getConfiguration()
            ->getResultCacheImpl()
            ->deleteAll()
        ;

        return parent::getList();
    }

    public function getObject($id): ?object
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            $filters = $this->entityManager->getFilters();
            if ($filters->isEnabled('softdeleted')) {
                $filters->disable('softdeleted');
            }
        }

        return parent::getObject($id);
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery(): ProxyQueryInterface
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN') || $user->hasRole('ROLE_ADMIN')) {
            $filters = $this->entityManager->getFilters();
            if ($filters->isEnabled('softdeleted')) {
                $filters->disable('softdeleted');
            }

            return parent::createQuery();
        }

        $query = parent::createQuery();
        // Not published are not visible
        // Others depends on project visibility
        $query
            ->leftJoin($query->getRootAliases()[0] . '.proposalForm', 'pF')
            ->leftJoin('pF.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->andWhere($query->getRootAliases()[0] . '.published = true')
            ->andWhere(
                $query
                    ->expr()
                    ->orX(
                        $query
                            ->expr()
                            ->andX(
                                $query->expr()->eq('authors.user', ':author'),
                                $query
                                    ->expr()
                                    ->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                            ),
                        $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
                    )
            )
        ;
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('fullReference', null, ['label' => 'global.reference'])
            ->add('titleInfo', null, [
                'label' => 'global.title',
                'template' => '@CapcoAdmin/Proposal/title_list_field.html.twig',
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => '@CapcoAdmin/common/author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => '@CapcoAdmin/Proposal/project_list_field.html.twig',
            ])
            ->add('category', ModelType::class, ['label' => 'global.category'])
            ->add('district', ModelType::class, ['label' => 'proposal.district'])
            ->add('lastStatus', null, [
                'label' => 'global.status',
                'template' => '@CapcoAdmin/Proposal/last_status_list_field.html.twig',
            ])
            ->add('publicationStatus', null, [
                'mapped' => false,
                'label' => 'global.state',
                'template' => '@CapcoAdmin/Proposal/state_list_field.html.twig',
            ])
            ->add('evaluers', null, ['label' => 'admin.fields.proposal.evaluers'])
            ->addIdentifier('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedInfo', 'datetime', [
                'label' => 'global.maj',
                'template' => '@CapcoAdmin/common/updated_info_list_field.html.twig',
            ])
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $currentUser = $this->tokenStorage->getToken()->getUser();

        $filter
            ->add('title', null, ['label' => 'global.title'])
            ->add('reference', null, ['label' => 'global.ref'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('trashedStatus', null, ['label' => 'project.trash'])
            ->add('draft', null, ['label' => 'proposal.state.draft'])
            ->add('updateAuthor', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'property' => 'email,username',
                    'label' => 'admin.fields.proposal.updateAuthor',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('district', null, ['label' => 'proposal.district'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('likers', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'admin.fields.proposal.likers',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.proposal.updated_at'])
        ;
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $filter->add('deletedAt', null, ['label' => 'global.deleted']);
        }
        $filter
            ->add('status', null, ['label' => 'global.status'])
            ->add('estimation', null, ['label' => 'admin.fields.proposal.estimation'])
            ->add('proposalForm.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
            ->add('evaluers', null, ['label' => 'admin.global.evaluers'])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['batch', 'list', 'edit']);
    }

    protected function configure(): void
    {
        $this->setTemplates([
            'edit' => '@CapcoAdmin/Proposal/edit.html.twig',
            'list' => '@CapcoAdmin/Proposal/list.html.twig',
        ]);
    }
}
