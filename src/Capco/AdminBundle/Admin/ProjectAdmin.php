<?php
namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\QueryBuilder;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProjectAdmin extends CapcoAdmin
{
    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'publishedAt'];

    protected $formOptions = ['cascade_validation' => true];

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
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'admin.fields.project.title'])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.project.author'],
                null,
                ['property' => 'username']
            );

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $datagridMapper->add('themes', null, ['label' => 'admin.fields.project.themes']);
        }

        $datagridMapper
            ->add('steps', null, ['label' => 'admin.fields.project.steps'])
            ->add('events', null, ['label' => 'admin.fields.project.events'])
            ->add('posts', null, ['label' => 'admin.fields.project.posts'])
            ->add('visibility', null, ['label' => 'who-can-see-this-project'])
            ->add('exportable', null, ['label' => 'admin.fields.project.exportable'])
            ->add('publishedAt', null, ['label' => 'admin.fields.project.published_at'])
            ->add('updatedAt', null, ['label' => 'admin.fields.project.updated_at'])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.project.title'])
            ->add('Author', 'sonata_type_model', ['label' => 'admin.fields.project.author']);

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
                'catalogue' => 'CapcoAppBundle',
            ])
            ->add('exportable', null, [
                'editable' => true,
                'label' => 'admin.fields.project.exportable',
            ])
            ->add('publishedAt', null, ['label' => 'admin.fields.project.published_at'])
            ->add('_action', 'actions', [
                'actions' => [
                    'display' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_display.html.twig',
                    ],
                    'download' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_download.html.twig',
                    ],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_delete.html.twig',
                    ],
                ],
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

        // Content
        $formMapper
            ->with('admin.fields.project.group_content', ['class' => 'col-md-12'])
            ->end()
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
        // Content
        $formMapper
            ->with('admin.fields.project.group_content')
            ->add('title', null, ['label' => 'admin.fields.project.title'])
            ->add('projectType', 'sonata_type_model', [
                'label' => 'admin.fields.project.type.title',
                'required' => false,
                'attr' => ['placeholder' => 'admin.help.project.type'],
                'choices_as_values' => true,
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.project.author',
                'property' => 'username',
            ])
            ->add('opinionTerm', 'choice', [
                'label' => 'admin.fields.project.opinion_term',
                'choices' => Project::$opinionTermsLabels,
                'translation_domain' => 'CapcoAppBundle',
            ]);

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get('security.authorization_checker')
                ->isGranted('ROLE_SUPER_ADMIN')
        ) {
            $formMapper
                ->add('externalLink', null, [
                    'label' => 'admin.fields.project.externalLink',
                    'required' => false,
                ])
                ->add('participantsCount', null, [
                    'label' => 'admin.fields.project.participantsCount',
                ])
                ->add('votesCount', null, ['label' => 'admin.fields.project.votesCount']);
        }

        $formMapper
            ->end()
            ->with('admin.fields.project.group_meta')
            ->add('publishedAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.project.published_at',
                'required' => true,
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
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
                'choices_as_values' => true,
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
                        'provider' => 'sonata.media.provider.image',
                    ],
                ]
            )
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
                'sonata_type_collection',
                [
                    'label' => 'admin.fields.project.steps',
                    'by_reference' => false,
                    'required' => false,
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
                'attr' => ['class' => 'project-visibility-selector'],
            ])
            ->add('restrictedViewerGroups', null, [
                'attr' => ['class' => 'project-visibility-group-selector'],
            ])
            ->end()
            ->with('admin.fields.project.advanced')
            ->add('metaDescription', null, [
                'label' => 'projects.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription',
            ])
            ->end();

        $formMapper->with('group.admin.parameters');
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper->add('opinionCanBeFollowed', null, [
                'label' => 'enable-proposal-tracking',
                'required' => false,
            ]);
        }
        $formMapper->add('exportable', null, [
            'label' => 'admin.fields.project.exportable',
            'required' => false,
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
            ->add('Author', null, ['label' => 'admin.fields.project.author'])
            ->add('Cover', null, [
                'template' => 'CapcoAdminBundle:Project:cover_show_field.html.twig',
                'label' => 'admin.fields.project.cover',
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
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'edit', 'delete', 'show']);
        $collection->add('preview', $this->getRouterIdParameter() . '/preview');
    }

    /**
     * if user is supper admin return all else return only what I can see
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
        $query->andWhere(
            $query
                ->expr()
                ->andX(
                    $query->expr()->eq($query->getRootAliases()[0] . '.Author', ':author'),
                    $query->expr()->eq($query->getRootAliases()[0] . '.visibility', 0)
                )
        );
        $query->orWhere($query->expr()->gte($query->getRootAliases()[0] . '.visibility', 1));
        $query->setParameter('author', $user);

        return $query;
    }
}
