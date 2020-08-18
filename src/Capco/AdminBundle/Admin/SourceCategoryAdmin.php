<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Filter\KnpTranslationFieldFilter;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class SourceCategoryAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'source_category';
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', TextType::class, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ]);
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', KnpTranslationFieldFilter::class, [
                'label' => 'global.title',
            ])
            ->add('sources', null, ['label' => 'global.sources.label'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }
}
