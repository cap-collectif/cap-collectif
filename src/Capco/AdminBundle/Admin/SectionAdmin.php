<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\Section;

class SectionAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by'    => 'position',
    );

    public function createQuery($context = 'list')
    {
        $manager = $this->getConfigurationPool()->getContainer()->get('capco.toggle.manager');
        $em = $this->getConfigurationPool()->getContainer()->get('doctrine.orm.entity_manager');

        $all = $em->getRepository('CapcoAppBundle:Section')->findAll();

        $ids = array();
        foreach ($all as $section) {
            if ($manager->containsEnabledFeature($section->getAssociatedFeatures())) {
                $ids[] = $section->getId();
            }
        }

        $query = parent::createQuery($context);
        $query->andWhere(
            $query->expr()->in($query->getRootAliases()[0].'.id', ':ids')
        );
        $query->setParameter('ids', $ids);

        return $query;
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.section.title',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.section.position',
            ))
            ->add('teaser', null, array(
                'label' => 'admin.fields.section.teaser',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.section.body',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.section.enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.section.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.section.updated_at',
            ))
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
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.section.title',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.section.enabled',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.section.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array('template' => 'CapcoAdminBundle:Section:list__action_delete.html.twig'),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $fields = Section::$fieldsForType[$this->getSubject()->getType()];

        if ($fields['title']) {
            $formMapper->add('title', null, array(
                'label' => 'admin.fields.section.title',
            ));
        } else {
            $formMapper->add('title', null, array(
                'label' => 'admin.fields.section.title',
                'read_only' => true,
            ));
        }

        $formMapper
            ->add('enabled', null, array(
                'label' => 'admin.fields.section.enabled',
                'required' => false,
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.section.position',
            ))
        ;

        if ($fields['teaser']) {
            $formMapper->add('teaser', null, array(
                'label' => 'admin.fields.section.teaser',
                'required' => false,
            ));
        }

        if ($fields['body']) {
            $formMapper->add('body', 'ckeditor', array(
                'label' => 'admin.fields.section.body',
                'config_name' => 'admin_editor',
            ));
        }

        if ($fields['nbObjects']) {
            $formMapper->add('nbObjects', null, array(
                'label' => 'admin.fields.section.nb_objects',
            ));
        }
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.section.title',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.section.enabled',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.section.position',
            ))
            ->add('teaser', 'ckeditor', array(
                'label' => 'admin.fields.section.teaser',
                'config_name' => 'admin_editor',
            ))
            ->add('body', 'ckeditor', array(
                'label' => 'admin.fields.section.body',
                'config_name' => 'admin_editor',
            ))
            ->add('nbObjects', null, array(
                'label' => 'admin.fields.section.nb_objects',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.section.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.section.updated_at',
            ))
        ;
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
