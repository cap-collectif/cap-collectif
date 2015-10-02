<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\CollectStep;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Capco\AppBundle\Entity\OtherStep;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\PresentationStep;
use Capco\AppBundle\Entity\SynthesisStep;
use Capco\AppBundle\Entity\RankingStep;
use Sonata\AdminBundle\Route\RouteCollection;

class StepAdmin extends Admin
{
    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $projectId = null;

        if ($subject && $subject->getProject()) {
            $project = $subject->getProject();
            if ($project) {
                $projectId = $project->getId();
            }
        } else {
            $projectId = $this->getRequest()->get('project_id');
        }

        return array(
            'project_id' => $projectId,
        );
    }

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    );

    protected $formOptions = array(
        'cascade_validation' => true,
    );

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $projectId = $this->getPersistentParameter('project_id');

        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.step.title',
                'required' => true,
            ))
        ;

        $formMapper
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.step.is_enabled',
                'required' => false,
            ))
            ->add('startAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.step.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ),
                'required' => false,
            ))
            ->add('endAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.step.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ),
                'required' => false,
            ))
        ;

        if ($subject instanceof PresentationStep || $subject instanceof OtherStep || $subject instanceof CollectStep) {
            $formMapper
                ->add('body', 'ckeditor', array(
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
            ;
        } elseif ($subject instanceof ConsultationStep) {
            $formMapper
                ->add('body', 'ckeditor', array(
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
                ->add('consultationStepType', 'sonata_type_model', array(
                    'label' => 'admin.fields.project.consultation_step_type',
                    'required' => true,
                    'btn_add' => false,
                ))
            ;
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', 'ckeditor', array(
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
                ->add('synthesis', 'sonata_type_admin', array(
                        'label' => 'admin.fields.step.synthesis',
                        'required' => true,
                ), ['link_parameters' => ['project_id']]
            );
        } elseif ($subject instanceof RankingStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('nbOpinionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_opinions_to_display',
                    'required' => true,
                ])
                ->add('nbVersionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_versions_to_display',
                    'required' => true,
                ])
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'edit', 'delete'));
    }

    public function prePersist($step)
    {
        if ($step instanceof SynthesisStep) {
            //$this->manageEmbeddedSynthesis($step);
        }
    }

    public function preUpdate($step)
    {
        if ($step instanceof SynthesisStep) {
            //$this->manageEmbeddedSynthesis($step);
        }
    }

    protected function manageEmbeddedSynthesis($step)
    {
        // Cycle through each field
        foreach ($this->getFormFieldDescriptions() as $fieldName => $fieldDescription) {
            // detect embedded Admin that manage Synthesis
            if ($fieldDescription->getType() === 'sonata_type_admin' &&
                ($associationMapping = $fieldDescription->getAssociationMapping()) &&
                $associationMapping['targetEntity'] === 'Capco\AppBundle\Entity\Synthesis\Synthesis'
            ) {
                $getter = 'get'.$fieldName;
                $setter = 'set'.$fieldName;

                /** @var Synthesis $synthesis */
                $synthesis = $step->$getter();
                if ($synthesis) {
                    $this->getConfigurationPool()->getContainer()->get('capco.synthesis.synthesis_handler')->createOrUpdateElementsFromSource($synthesis);
                }
            }
        }
    }
}
