<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Toggle\Manager;
use Sonata\CoreBundle\Model\Metadata;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Elasticsearch\Indexer;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\CoreBundle\Validator\ErrorElement;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Validator\Constraints\Required;

final class ProjectAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'publishedAt'];

    protected $formOptions = ['cascade_validation' => true];
    private $tokenStorage;
    private $indexer;
    /**
     * @var EntityManagerInterface
     */
    private $projectDistrictRepository;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        ProjectDistrictRepository $projectDistrictRepository,
        Indexer $indexer
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->indexer = $indexer;
        $this->projectDistrictRepository = $projectDistrictRepository;
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

    public function preRemove($object)
    {
        $this->indexer->remove(\get_class($object), $object->getId());
        $this->indexer->finishBulk();
        parent::preRemove($object);
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

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Project:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
        $query
            ->leftJoin($query->getRootAliases()[0] . '.authors', 'authors')
            ->andWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('authors.user', ':author'),
                        $query->expr()->eq($query->getRootAliases()[0] . '.visibility', 0)
                    )
            );
        $query->orWhere($query->expr()->gte($query->getRootAliases()[0] . '.visibility', 1));
        $query->setParameter('author', $user);

        return $query;
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('steps', null, ['label' => 'admin.fields.project.steps'])
            ->add('events', null, ['label' => 'admin.fields.project.events'])
            ->add('posts', null, ['label' => 'admin.fields.project.posts'])
            ->add('visibility', null, ['label' => 'who-can-see-this-project'])
            ->add('exportable', null, ['label' => 'admin.fields.project.exportable'])
            ->add('publishedAt', null, ['label' => 'admin.fields.project.published_at'])
            ->add('updatedAt', null, ['label' => 'admin.fields.project.updated_at'])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold'
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold'
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper->addIdentifier('title', null, ['label' => 'admin.fields.project.title']);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $listMapper->add('themes', null, ['label' => 'admin.fields.project.themes']);
        }

        $listMapper
            ->add('visibility', ChoiceType::class, [
                'template' => 'CapcoAdminBundle:Project:visibility_list_field.html.twig',
                'choices' => ProjectVisibilityMode::REVERSE_KEY_VISIBILITY,
                'label' => 'project-access',
                'catalogue' => 'CapcoAppBundle'
            ])
            ->add('exportable', null, [
                'editable' => true,
                'label' => 'admin.fields.project.exportable'
            ])
            ->add('publishedAt', null, ['label' => 'admin.fields.project.published_at'])
            ->add('_action', 'actions', [
                'actions' => [
                    'display' => [
                        'template' => 'CapcoAdminBundle:Project:list__action_display.html.twig'
                    ],
                    'download' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_download.html.twig'
                    ],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_delete.html.twig'
                    ]
                ]
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get('security.authorization_checker')
                ->isGranted('ROLE_SUPER_ADMIN')
        ) {
            $formMapper
                ->with('admin.fields.project.group_external', ['class' => 'col-md-12'])
                ->end();
        }
        $formMapper
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
            ->with('group.admin.parameters', ['class' => 'col-md-6'])
            ->end();

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get('security.authorization_checker')
                ->isGranted('ROLE_SUPER_ADMIN')
        ) {
            // TODO idea : if the external project is from a capco platform we can get participants an contribution from our API
            $formMapper
                ->end()
                ->with('admin.fields.project.group_external')
                ->add('isExternal', CheckboxType::class, [
                    'label' => 'external-project',
                    'required' => false
                ])
                ->add('externalLink', UrlType::class, [
                    'label' => 'admin.fields.project.externalLink',
                    'required' => false
                ])
                ->add('externalParticipantsCount', NumberType::class, [
                    'label' => 'admin.fields.project.participantsCount',
                    'required' => false
                ])
                ->add('externalContributionsCount', NumberType::class, [
                    'label' => 'admin.fields.project.contributionsCount',
                    'required' => false
                ])
                ->add('externalVotesCount', NumberType::class, [
                    'label' => 'admin.fields.project.votesCount',
                    'required' => false
                ]);
        }

        $formMapper
            ->end()
            ->with('admin.fields.project.group_meta')
            ->add('publishedAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.project.published_at',
                'required' => true,
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm']
            ]);

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $formMapper->add('themes', 'sonata_type_model', [
                'label' => 'admin.fields.project.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
                'choices_as_values' => true
            ]);
        }

        // Ranking
        // Steps
        $formMapper
            ->add(
                'Cover',
                'sonata_type_model_list',
                ['required' => false, 'label' => 'admin.fields.project.cover'],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image'
                    ]
                ]
            )
            ->add(
                'video',
                null,
                [
                    'label' => 'admin.fields.project.video',
                    'required' => false,
                    'help' => 'admin.help.project.video'
                ],
                ['link_parameters' => ['context' => 'project']]
            )
            ->add('districts', EntityType::class, [
                'mapped' => false,
                'class' => ProjectDistrict::class,
                'label' => 'proposal_form.districts',
                'data' => $this->projectDistrictRepository
                    ->createQueryBuilder('d')
                    ->leftJoin('d.projectDistrictPositioners', 'positioner')
                    ->andWhere('positioner.project = :project')
                    ->setParameter('project', $this->subject->getId())
                    ->orderBy('positioner.position', 'asc')
                    ->getQuery()
                    ->getResult(),
                'choices' => $this->projectDistrictRepository->findAll(),
                'multiple' => true,
                'choice_value' => function (ProjectDistrict $district) {
                    return $district->getName();
                }
            ])
            ->end()
            ->with('admin.fields.project.group_ranking')
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
                'required' => false
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
                'required' => false
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
                'required' => false
            ])
            ->end()
            ->with('admin.fields.project.group_steps')
            ->add(
                'steps',
                'sonata_type_collection',
                [
                    'label' => 'admin.fields.project.steps',
                    'by_reference' => false,
                    'required' => false
                ],
                ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
            )
            ->end();

        $formMapper
            ->with('project-access')
            ->add('visibility', ChoiceType::class, [
                'choices' => ProjectVisibilityMode::VISIBILITY_WITH_HELP_TEXT,
                'label' => 'who-can-see-this-project',
                'multiple' => false,
                'expanded' => true,
                'required' => true,
                'choices_as_values' => true,
                'choice_translation_domain' => 'CapcoAppBundle',
                'attr' => ['class' => 'project-visibility-selector']
            ])
            ->add('restrictedViewerGroups', null, [
                'attr' => ['class' => 'project-visibility-group-selector']
            ])
            ->end()
            ->with('admin.fields.project.advanced')
            ->add('metaDescription', null, [
                'label' => 'projects.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription'
            ])
            ->end();

        $formMapper->with('group.admin.parameters');
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper->add('opinionCanBeFollowed', null, [
                'label' => 'enable-proposal-tracking',
                'required' => false
            ]);
        }
        $formMapper->add('exportable', null, [
            'label' => 'admin.fields.project.exportable',
            'required' => false
        ]);
        $formMapper->end();
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper->with('admin.fields.project.general')->end();

        $showMapper
            ->with('admin.fields.project.general')
            ->add('title', null, ['label' => 'admin.fields.project.title'])
            ->add('visibility', null, ['label' => 'who-can-see-this-project'])
            ->add('exportable', null, ['label' => 'admin.fields.project.exportable'])
            ->add('publishedAt', null, ['label' => 'admin.fields.project.published_at'])
            ->add('Cover', null, [
                'template' => 'CapcoAdminBundle:Project:cover_show_field.html.twig',
                'label' => 'admin.fields.project.cover'
            ])
            ->add('video', null, ['label' => 'admin.fields.project.video']);

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $showMapper->add('themes', null, ['label' => 'admin.fields.project.themes']);
        }

        $showMapper
            ->add('steps', null, ['label' => 'admin.fields.project.steps'])
            ->add('events', null, ['label' => 'admin.fields.project.events'])
            ->add('posts', null, ['label' => 'admin.fields.project.posts'])
            ->add('createdAt', null, ['label' => 'admin.fields.project.created_at'])
            ->add('updatedAt', null, ['label' => 'admin.fields.project.updated_at'])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold'
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold'
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author'
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'edit', 'delete', 'show']);
        $collection->add('preview', $this->getRouterIdParameter() . '/preview');
    }
}
