<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Sonata\AdminBundle\Form\Type\ModelType;

class ProposalAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'proposal';
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];
    private $tokenStorage;
    private $indexer;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        Indexer $indexer
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->indexer = $indexer;
    }

    public function preRemove($object)
    {
        $this->indexer->remove(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preRemove($object);
    }

    public function postUpdate($object)
    {
        /** @var Proposal $object */
        $container = $this->getConfigurationPool()->getContainer();
        if ($container) {
            $elasticsearchDoctrineListener = $container->get(ElasticsearchDoctrineListener::class);

            // Index Proposal
            $elasticsearchDoctrineListener->addToMessageStack($object);

            // Index Comments
            $comments = $object->getComments();
            if (null !== $comments) {
                array_map(static function ($comment) use ($elasticsearchDoctrineListener) {
                    return $elasticsearchDoctrineListener->addToMessageStack($comment);
                }, $comments->toArray());
            }

            // Index votes
            $collectVotes = $object->getCollectVotes()->toArray();
            $selectionVotes = $object->getSelectionVotes()->toArray();
            $votes = array_merge($collectVotes, $selectionVotes);
            if (!empty($votes)) {
                array_map(static function ($vote) use ($elasticsearchDoctrineListener) {
                    $elasticsearchDoctrineListener->addToMessageStack($vote);
                }, $votes);
            }
        }
        parent::postUpdate($object);
    }

    public function getList()
    {
        // Remove APC Cache for soft delete
        $em = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager();
        $em->getConfiguration()
            ->getResultCacheImpl()
            ->deleteAll();

        return parent::getList();
    }

    public function getObject($id)
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            $em = $this->getConfigurationPool()
                ->getContainer()
                ->get('doctrine')
                ->getManager();
            $filters = $em->getFilters();
            if ($filters->isEnabled('softdeleted')) {
                $filters->disable('softdeleted');
            }
        }

        return parent::getObject($id);
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN') || $user->hasRole('ROLE_ADMIN')) {
            $em = $this->getConfigurationPool()
                ->getContainer()
                ->get('doctrine')
                ->getManager();
            $filters = $em->getFilters();
            if ($filters->isEnabled('softdeleted')) {
                $filters->disable('softdeleted');
            }

            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
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
            );
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('fullReference', null, ['label' => 'global.reference'])
            ->add('titleInfo', null, [
                'label' => 'global.title',
                'template' => 'CapcoAdminBundle:Proposal:title_list_field.html.twig',
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:common:author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => 'CapcoAdminBundle:Proposal:project_list_field.html.twig',
            ])
            ->add('category', ModelType::class, ['label' => 'global.category'])
            ->add('district', ModelType::class, ['label' => 'proposal.district'])
            ->add('lastStatus', null, [
                'label' => 'global.status',
                'template' => 'CapcoAdminBundle:Proposal:last_status_list_field.html.twig',
            ])
            ->add('state', null, [
                'mapped' => false,
                'label' => 'global.state',
                'template' => 'CapcoAdminBundle:Proposal:state_list_field.html.twig',
            ])
            ->add('evaluers', null, ['label' => 'admin.fields.proposal.evaluers'])
            ->addIdentifier('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedInfo', 'datetime', [
                'label' => 'global.maj',
                'template' => 'CapcoAdminBundle:common:updated_info_list_field.html.twig',
            ]);
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();

        $datagridMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('reference', null, ['label' => 'global.ref'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('trashedStatus', null, ['label' => 'project.trash'])
            ->add('draft', null, ['label' => 'proposal.state.draft'])
            ->add(
                'updateAuthor',
                ModelAutocompleteFilter::class,
                ['label' => 'admin.fields.proposal.updateAuthor'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ]
            )
            ->add('district', null, ['label' => 'proposal.district'])
            ->add('author', ModelAutocompleteFilter::class, ['label' => 'global.author'], null, [
                'property' => 'email,username',
                'to_string_callback' => function ($entity, $property) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add(
                'likers',
                ModelAutocompleteFilter::class,
                ['label' => 'admin.fields.proposal.likers'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ]
            )
            ->add('updatedAt', null, ['label' => 'admin.fields.proposal.updated_at']);
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $datagridMapper->add('deletedAt', null, ['label' => 'global.deleted']);
        }
        $datagridMapper
            ->add('status', null, ['label' => 'global.status'])
            ->add('estimation', null, ['label' => 'admin.fields.proposal.estimation'])
            ->add('proposalForm.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
            ->add('evaluers', null, ['label' => 'admin.global.evaluers']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'edit']);
    }
}
