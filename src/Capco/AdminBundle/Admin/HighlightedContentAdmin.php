<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\HighlightedContent;
use Capco\AppBundle\Entity\HighlightedPost;
use Capco\AppBundle\Entity\HighlightedEvent;
use Capco\AppBundle\Entity\HighlightedTheme;
use Capco\AppBundle\Entity\HighlightedIdea;
use Capco\AppBundle\Entity\HighlightedConsultation;

class HighlightedContentAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    );

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('move_actions', 'actions', array(
                'label' => 'admin.action.highlighted_content.move_actions.label',
                'template' => 'SonataAdminBundle:CRUD:list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => array(
                    'up' => array(
                        'template' => 'CapcoAdminBundle:HighlightedContent:list__action_up.html.twig',
                    ),
                    'down' => array(
                        'template' => 'CapcoAdminBundle:HighlightedContent:list__action_down.html.twig',
                    ),
                ),
            ))
            ->add('object', null, [
                  'label' => 'admin.fields.highlighted_content.object',
                  'mapped' => false,
                  'template' => 'CapcoAdminBundle:HighlightedContent:list__object.html.twig',
            ])
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $formMapper
            ->add('position', null, array(
                'label' => 'admin.fields.highlighted_content.position',
            ))
        ;

        if ($subject instanceof HighlightedPost) {
            $formMapper
                ->add('post', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.post',
                    'class' => 'Capco\AppBundle\Entity\Post',
                ))
            ;
        } elseif ($subject instanceof HighlightedConsultation) {
            $formMapper
                ->add('consultation', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.consultation',
                    'class' => 'Capco\AppBundle\Entity\Consultation',
                ))
            ;
        } elseif ($subject instanceof HighlightedIdea) {
            $formMapper
                ->add('idea', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.idea',
                    'class' => 'Capco\AppBundle\Entity\Idea',
                ))
            ;
        } elseif ($subject instanceof HighlightedEvent) {
            $formMapper
                ->add('event', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.event',
                    'class' => 'Capco\AppBundle\Entity\Event',
                ))
            ;
        } elseif ($subject instanceof HighlightedTheme) {
            $formMapper
                ->add('theme', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.theme',
                    'class' => 'Capco\AppBundle\Entity\Theme',
                ))
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('down', $this->getRouterIdParameter().'/down');
        $collection->add('up', $this->getRouterIdParameter().'/up');
    }
}
