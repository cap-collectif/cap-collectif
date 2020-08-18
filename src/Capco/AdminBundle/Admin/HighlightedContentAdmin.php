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
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Form\Type\ModelType;

class HighlightedContentAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'highlighted_content';
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:HighlightedContent:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('move_actions', 'actions', [
                'label' => 'admin.action.highlighted_content.move_actions.label',
                'template' => 'SonataAdminBundle:CRUD:list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => [
                    'up' => [
                        'template' =>
                            'CapcoAdminBundle:HighlightedContent:list__action_up.html.twig',
                    ],
                    'down' => [
                        'template' =>
                            'CapcoAdminBundle:HighlightedContent:list__action_down.html.twig',
                    ],
                ],
            ])
            ->add('object', null, [
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
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $formMapper->add('position', null, [
            'label' => 'global.position',
        ]);

        if ($subject instanceof HighlightedPost) {
            $formMapper->add('post', ModelType::class, [
                'label' => 'global.article',
                'class' => Post::class,
            ]);
        } elseif ($subject instanceof HighlightedProject) {
            $formMapper->add('project', ModelType::class, [
                'label' => 'global.project',
                'class' => Project::class,
            ]);
        } elseif ($subject instanceof HighlightedEvent) {
            $formMapper->add('event', ModelType::class, [
                'label' => 'admin.fields.highlighted_content.event',
                'class' => Event::class,
            ]);
        } elseif ($subject instanceof HighlightedTheme) {
            $formMapper->add('theme', ModelType::class, [
                'label' => 'global.theme',
                'class' => Theme::class,
            ]);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('down', $this->getRouterIdParameter() . '/down');
        $collection->add('up', $this->getRouterIdParameter() . '/up');
    }
}
