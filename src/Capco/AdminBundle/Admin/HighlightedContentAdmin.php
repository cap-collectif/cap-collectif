<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\HighlightedEvent;
use Capco\AppBundle\Entity\HighlightedPost;
use Capco\AppBundle\Entity\HighlightedProject;
use Capco\AppBundle\Entity\HighlightedTheme;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class HighlightedContentAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'highlighted_content';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected function configure(): void
    {
        //$this->setTemplate('edit', 'CapcoAdminBundle:HighlightedContent:edit.html.twig');
        parent::configure();
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('move_actions', 'actions', [
                'label' => 'admin.action.highlighted_content.move_actions.label',
                'template' => 'SonataAdminBundle:CRUD:list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => [
                    'up' => [
                        'template' => 'CapcoAdminBundle:HighlightedContent:list__action_up.html.twig',
                    ],
                    'down' => [
                        'template' => 'CapcoAdminBundle:HighlightedContent:list__action_down.html.twig',
                    ],
                ],
            ])
            ->add('currentObjectType', null, [
                'label' => 'global.contenu',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:HighlightedContent:list__object.html.twig',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $subject = $this->getSubject();

        $filters = $this->getModelManager()->getEntityManager(Event::class)->getFilters();
        if (!$filters->isEnabled('softdeleted')) {
            $filters->enable('softdeleted');
        }

        $form->add('position', null, [
            'label' => 'global.position',
        ]);

        if ($subject instanceof HighlightedPost) {
            $form->add('post', ModelType::class, [
                'label' => 'global.article',
                'class' => Post::class,
            ]);
        } elseif ($subject instanceof HighlightedProject) {
            $form->add('project', ModelType::class, [
                'label' => 'global.project',
                'class' => Project::class,
            ]);
        } elseif ($subject instanceof HighlightedEvent) {
            $form->add('event', ModelType::class, [
                'label' => 'admin.fields.highlighted_content.event',
                'class' => Event::class,
            ]);
        } elseif ($subject instanceof HighlightedTheme) {
            $form->add('theme', ModelType::class, [
                'label' => 'global.theme',
                'class' => Theme::class,
            ]);
        }
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('down', $this->getRouterIdParameter() . '/down');
        $collection->add('up', $this->getRouterIdParameter() . '/up');
    }
}
