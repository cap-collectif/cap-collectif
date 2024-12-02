<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryVotesResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Overblog\GraphQLBundle\Definition\Argument;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Datagrid\ProxyQuery;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class SectionAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_section';
    protected $baseRoutePattern = 'capco/app/section';
    protected ?string $classnameLabel = 'section';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        private readonly Manager $manager,
        private readonly SectionRepository $repository,
        private readonly QueryVotesResolver $queryVotesResolver,
        private readonly QueryEventsResolver $queryEventsResolver,
        private readonly CollectStepRepository $collectStepRepository
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function createQuery(): ProxyQueryInterface
    {
        $ids = [];
        foreach ($this->repository->findAll() as $section) {
            if ($this->manager->containsEnabledFeature($section->getAssociatedFeatures())) {
                $ids[] = $section->getId();
            }
        }

        $query = parent::createQuery();
        $query->andWhere($query->expr()->in($query->getRootAliases()[0] . '.id', ':ids'));
        $query->setParameter('ids', $ids);

        return $query;
    }

    public function getBatchActions(): array
    {
        return [];
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('teaser', null, [
                'label' => 'global.subtitle',
            ])
            ->add('body', null, [
                'label' => 'global.contenu',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('move_actions', 'actions', [
                'label' => 'admin.action.highlighted_content.move_actions.label',
                'template' => '@SonataAdmin/CRUD/list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => [
                    'up' => [
                        'template' => '@CapcoAdmin/Section/list__action_up.html.twig',
                    ],
                    'down' => [
                        'template' => '@CapcoAdmin/Section/list__action_down.html.twig',
                    ],
                ],
            ])
            ->addIdentifier('title', null, [
                'label' => 'global.title',
                'route' => [
                    'name' => 'edit',
                ],
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
                'editable' => true,
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [
                        'template' => '@CapcoAdmin/Section/list__action_delete.html.twig',
                    ],
                ],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $fields = Section::$fieldsForType[$this->getSubject()->getType()];
        $subject = $this->getSubject();

        $form->with('admin.label.settings.global');
        if ($fields['title']) {
            $form->add('title', TextType::class, [
                'label' => 'global.title',
                'required' => true,
                'help' => 'be-concise-1-or-2-words',
            ]);
        } else {
            $form->add('title', TextType::class, [
                'label' => 'global.title',
                'attr' => ['readonly' => true],
            ]);
        }

        if ($fields['teaser']) {
            $form->add('teaser', TextType::class, [
                'label' => 'global.subtitle',
                'required' => false,
                'help' => 'support-your-title',
            ]);
        }

        if ($fields['body']) {
            $form->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ]);
        }

        if ($fields['nbObjects']) {
            $form->add('nbObjects', null, [
                'label' => 'admin.fields.section.nb_objects',
            ]);
        }

        if ($subject && 'proposals' === $subject->getType()) {
            $form->add('step', ModelType::class, [
                'label' => 'global.collect.step.label',
                'required' => true,
                'query' => $this->createQueryForCollectSteps(),
            ]);
        }
        $form->end();

        if ($subject && 'metrics' === $subject->getType()) {
            $args = new Argument(['first' => 100]);

            $basicsMetricsLabel =
                $this->queryVotesResolver->__invoke($args)->getTotalCount() > 0
                    ? 'admin.fields.section.basicsMetrics'
                    : 'admin.fields.section.basicsMetricsNoVotes';

            $form
                ->with('admin.label.section.display.metrics')
                ->add('metricsToDisplayBasics', null, [
                    'label' => $basicsMetricsLabel,
                ])
                ->add('metricsToDisplayProjects', null, [
                    'label' => 'admin.fields.section.projectsMetrics',
                ])
            ;

            if ($this->queryEventsResolver->getEventsConnection($args)->getTotalCount() > 0) {
                $form->add('metricsToDisplayEvents', null, [
                    'label' => 'global.events',
                ]);
            }
            $form->end();
        }

        $form
            ->with('admin.label.section.publication')
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->end()
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('teaser', CKEditorType::class, [
                'label' => 'global.subtitle',
                'config_name' => 'admin_editor',
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('nbObjects', null, [
                'label' => 'admin.fields.section.nb_objects',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('down', $this->getRouterIdParameter() . '/down');
        $collection->add('up', $this->getRouterIdParameter() . '/up');
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/CRUD/edit.html.twig');
    }

    private function createQueryForCollectSteps(): ProxyQuery
    {
        $qb = $this->collectStepRepository
            ->createQueryBuilder('cs')
            ->where('cs.isEnabled = :enabled')
            ->setParameter('enabled', true)
        ;

        return new ProxyQuery($qb);
    }
}
