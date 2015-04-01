<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\HighlightedContent;

class HighlightedContentAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('move_actions', 'actions', array(
                'label' => 'admin.action.section.move_actions.label',
                'template' => 'SonataAdminBundle:CRUD:list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => array(
                    'up' => array(
                        'template' => 'CapcoAdminBundle:Section:list__action_up.html.twig',
                    ),
                    'down' => array(
                        'template' => 'CapcoAdminBundle:Section:list__action_down.html.twig',
                    ),
                ),
            ))
            ->add('post', null, array(
                'label' => 'admin.fields.highlighted_content.post',
                'required' => false,
            ))
            ->add('consultation', null, array(
                'label' => 'admin.fields.highlighted_content.consultation',
                'required' => false,
            ))
            ->add('idea', null, array(
                'label' => 'admin.fields.highlighted_content.idea',
                'required' => false,
            ))
            ->add('event', null, array(
                'label' => 'admin.fields.highlighted_content.event',
                'required' => false,
            ))
            ->add('theme', null, array(
                'label' => 'admin.fields.highlighted_content.theme',
                'required' => false,
            ))
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

        if ($subject instanceof \Capco\AppBundle\Entity\HighlightedPost) {
            $formMapper
                ->add('post', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.post',
                    'class' => 'Capco\AppBundle\Entity\Post',
                ))
            ;

        }

        if ($subject instanceof \Capco\AppBundle\Entity\HighlightedConsultation) {
            $formMapper
                ->add('consultation', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.consultation',
                    'class' => 'Capco\AppBundle\Entity\Consultation',
                ))
            ;
        }

        if ($subject instanceof \Capco\AppBundle\Entity\HighlightedIdea) {
            $formMapper
                ->add('idea', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.idea',
                    'class' => 'Capco\AppBundle\Entity\Idea',
                ))
            ;
        }

        if ($subject instanceof \Capco\AppBundle\Entity\HighlightedEvent) {
            $formMapper
                ->add('event', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.event',
                    'class' => 'Capco\AppBundle\Entity\Event',
                ))
            ;
        }

        if ($subject instanceof \Capco\AppBundle\Entity\HighlightedTheme) {
            $formMapper
                ->add('theme', 'sonata_type_model', array(
                    'label' => 'admin.fields.highlighted_content.theme',
                    'class' => 'Capco\AppBundle\Entity\Theme',
                ))
            ;
        }
    }

    public function getBatchActions()
    {
        return array();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('down', $this->getRouterIdParameter().'/down');
        $collection->add('up', $this->getRouterIdParameter().'/up');
    }

}
