<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Object\Metadata;
use Sonata\AdminBundle\Object\MetadataInterface;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\Form\Type\CollectionType;
use Sonata\Form\Type\DateTimePickerType;
use Sonata\Form\Validator\ErrorElement;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Validator\Constraints\Required;

final class ProjectAdmin extends CapcoAdmin
{
    protected ?string $classnameLabel = 'project';
    protected array $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'publishedAt'];

    protected array $formOptions = ['cascade_validation' => true];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly GlobalDistrictRepository $globalDistrictRepository,
        private readonly Manager $manager,
        private readonly MediaProvider $mediaProvider,
        private readonly ElasticsearchDoctrineListener $elasticsearchDoctrineListener,
        private readonly ProposalCommentRepository $proposalCommentRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function validate(ErrorElement $errorElement, $object)
    {
        if (empty($object->getAuthors())) {
            $errorElement
                ->with('author')
                ->addConstraint(new Required())
                ->addViolation('global.required')
                ->end()
            ;
        }
    }

    public function postUpdate($object): void
    {
        // @var Project $object

        // Index project
        $this->elasticsearchDoctrineListener->addToMessageStack($object);

        // Index comments
        $comments = $this->proposalCommentRepository->getCommentsByProject($object) ?? [];
        if (!empty($comments)) {
            array_map(function ($comment) {
                $this->elasticsearchDoctrineListener->addToMessageStack($comment);
            }, $comments);
        }

        // Index Votes
        $selectionVotes = $this->proposalSelectionVoteRepository->getVotesByProject($object) ?? [];
        $collectVotes = $this->proposalCollectVoteRepository->getVotesByProject($object) ?? [];
        $votes = array_merge($collectVotes, $selectionVotes);
        if (!empty($votes)) {
            array_map(function ($vote) {
                $this->elasticsearchDoctrineListener->addToMessageStack($vote);
            }, $votes);
        }

        parent::postUpdate($object);
    }

    // For mosaic view
    public function getObjectMetadata($object): MetadataInterface
    {
        $cover = $object->getcover();
        if ($cover) {
            return new Metadata(
                $object->getTitle(),
                null,
                $this->mediaProvider->generatePublicUrl(
                    $cover,
                    $this->mediaProvider->getFormatName($cover, 'form')
                )
            );
        }

        return parent::getObjectMetadata($object);
    }

    public function getExportFormats(): array
    {
        return [];
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery(): ProxyQueryInterface
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery();
        }

        $query = parent::createQuery();
        $query
            ->leftJoin($query->getRootAliases()[0] . '.authors', 'authors')
            ->andWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('authors.user', ':author'),
                        $query->expr()->eq($query->getRootAliases()[0] . '.visibility', 0)
                    )
            )
        ;
        $query->orWhere($query->expr()->gte($query->getRootAliases()[0] . '.visibility', 1));
        $query->setParameter('author', $user);

        if ($user->hasRole(UserRole::ROLE_PROJECT_ADMIN)) {
            $query
                ->andWhere($query->getRootAliases()[0] . '.owner = :owner')
                ->setParameter('owner', $user)
            ;
        }

        return $query;
    }

    protected function configure(): void
    {
        //$this->setTemplate('list', '@CapcoAdmin/Project/list.html.twig');
        //$this->setTemplate('edit', '@CapcoAdmin/Project/edit.html.twig');
        parent::configure();
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, ['label' => 'global.title'])
            ->add('steps', null, ['label' => 'project.show.meta.step.title'])
            ->add('events', null, ['label' => 'global.events'])
            ->add('posts', null, ['label' => 'global.articles'])
            ->add('visibility', null, ['label' => 'who-can-see-this-project'])
            ->add('publishedAt', null, ['label' => 'global.publication'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        //$this->setTemplate(
        $list->addIdentifier('title', null, [
            'label' => 'global.title',
            'template' => '@CapcoAdmin/Project/title_list_field.html.twig',
        ]);
        if ($this->manager->isActive('themes')) {
            $list->add('themes', null, ['label' => 'global.themes']);
        }

        $actions = [
            'display' => [
                'template' => '@CapcoAdmin/Project/list__action_display.html.twig',
            ],
            'download' => [
                'template' => '@CapcoAdmin/CRUD/list__action_download.html.twig',
            ],
            'delete' => [
                'template' => '@CapcoAdmin/CRUD/list__action_delete.html.twig',
            ],
        ];

        $currentUser = $this->tokenStorage->getToken()->getUser();
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $actions['duplicate'] = [
                'template' => '@CapcoAdmin/Project/list__action_duplicate.html.twig',
            ];
        }

        $list
            ->add('visibility', ChoiceType::class, [
                'template' => '@CapcoAdmin/Project/visibility_list_field.html.twig',
                'choices' => ProjectVisibilityMode::REVERSE_KEY_VISIBILITY,
                'label' => 'project-access',
                'catalogue' => 'CapcoAppBundle',
            ])
            ->add('publishedAt', null, ['label' => 'global.publication'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => $actions,
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $currentUser = $this->tokenStorage->getToken()->getUser();

        $form
            ->with('admin.fields.project.group_meta', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.project.group_ranking', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.project.group_steps', ['class' => 'col-md-12'])
            ->end()
            ->with('project-access', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.project.advanced', ['class' => 'col-md-6'])
            ->end()
        ;
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $form->with('group.admin.parameters', ['class' => 'col-md-6'])->end();
        }
        $form
            ->end()
            ->with('admin.fields.project.group_meta')
            ->add('publishedAt', DateTimePickerType::class, [
                'label' => 'global.publication',
                'required' => true,
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
            ])
        ;

        if ($this->manager->isActive('themes')) {
            $form->add('themes', ModelType::class, [
                'label' => 'global.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
            ]);
        }

        // Ranking
        // Steps
        $form
            ->add('cover', ModelListType::class, ['required' => false, 'label' => 'global.image'])
            ->add(
                'video',
                null,
                [
                    'label' => 'admin.fields.project.video',
                    'required' => false,
                    'help' => 'admin.help.project.video',
                ],
                ['link_parameters' => ['context' => 'project']]
            )
        ;
        if ($this->hasSubject()) {
            $form->add('districts', EntityType::class, [
                'mapped' => false,
                'class' => GlobalDistrict::class,
                'required' => false,
                'label' => 'proposal_form.districts',
                'data' => $this->globalDistrictRepository
                    ->createQueryBuilder('d')
                    ->leftJoin('d.projectDistrictPositioners', 'positioner')
                    ->andWhere('positioner.project = :project')
                    ->setParameter('project', $this->getSubject()->getId())
                    ->orderBy('positioner.position', 'ASC')
                    ->getQuery()
                    ->getResult(),
                'choices' => $this->globalDistrictRepository->findAllOrderedByPosition(
                    $this->getSubject()->getId()
                ),
                'multiple' => true,
                'choice_label' => function (GlobalDistrict $district) {
                    return $district->getName();
                },
            ]);
        }
        $form
            ->end()
            ->with('admin.fields.project.group_ranking')
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
                'required' => false,
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
                'required' => false,
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
                'required' => false,
            ])
            ->end()
            ->with('admin.fields.project.group_steps')
            ->add(
                'steps',
                CollectionType::class,
                [
                    'label' => 'project.show.meta.step.title',
                    'by_reference' => false,
                    'required' => false,
                    'type_options' => [
                        'delete' => true,
                        'delete_options' => [
                            'type' => CheckboxType::class,
                            'type_options' => [
                                'mapped' => false,
                                'required' => false,
                                // we need to pass an empty label, without we got an error 500
                                // where is the logic, idk, this is sonata
                                'label' => '',
                            ],
                        ],
                    ],
                ],
                ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
            )
            ->end()
        ;

        $form
            ->with('project-access')
            ->add('visibility', ChoiceType::class, [
                'choices' => ProjectVisibilityMode::VISIBILITY_WITH_HELP_TEXT,
                'label' => 'who-can-see-this-project',
                'multiple' => false,
                'expanded' => true,
                'required' => true,

                'choice_translation_domain' => 'CapcoAppBundle',
                'attr' => ['class' => 'project-visibility-selector'],
            ])
            ->add('restrictedViewerGroups', null, [
                'attr' => ['class' => 'project-visibility-group-selector'],
            ])
            ->end()
            ->with('admin.fields.project.advanced')
            ->add('metaDescription', null, [
                'label' => 'global.meta.description',
                'required' => false,
                'help' => 'admin.help.metadescription',
            ])
            ->end()
        ;
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $form->with('group.admin.parameters');
            $form->add('opinionCanBeFollowed', null, [
                'label' => 'enable-proposal-tracking',
                'required' => false,
            ]);
            $form->end();
        }
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show->with('admin.fields.project.general')->end();

        $show
            ->with('admin.fields.project.general')
            ->add('title', null, ['label' => 'global.title'])
            ->add('visibility', null, ['label' => 'who-can-see-this-project'])
            ->add('publishedAt', null, ['label' => 'global.publication'])
            ->add('cover', null, [
                'template' => '@CapcoAdmin/Project/cover_show_field.html.twig',
                'label' => 'global.image',
            ])
            ->add('video', null, ['label' => 'admin.fields.project.video'])
        ;

        if ($this->manager->isActive('themes')) {
            $show->add('themes', null, ['label' => 'global.themes']);
        }

        $show
            ->add('steps', null, ['label' => 'project.show.meta.step.title'])
            ->add('events', null, ['label' => 'global.events'])
            ->add('posts', null, ['label' => 'global.articles'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ])
            ->end()
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('duplicate');
        $collection->clearExcept(['edit', 'delete', 'show', 'duplicate']);
        $collection->add('preview', $this->getRouterIdParameter() . '/preview');
    }
}
