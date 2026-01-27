import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, Award, Upload } from 'lucide-react'
import { db } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdvisorVerification() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sebiRegNumber: '',
    sebiType: 'RIA', // RIA or RA
    experienceYears: '',
    specialty: '',
    qualifications: '',
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await db.createAdvisorVerification({
        user_id: user.id,
        sebi_registration_number: formData.sebiRegNumber,
        sebi_type: formData.sebiType,
        experience_years: parseInt(formData.experienceYears),
        specialty: formData.specialty,
        qualifications: formData.qualifications.split(',').map(q => q.trim()),
        verification_status: 'pending'
      })

      if (error) throw error

      toast.success('Verification request submitted!')
      navigate('/auth/verification-pending')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col safe-area-top">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-2">Advisor Verification</h1>
      </header>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Info Banner */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary-900 text-sm mb-1">
                SEBI Verification Required
              </h3>
              <p className="text-xs text-primary-700">
                All advisors must be SEBI-registered. We'll verify your credentials within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          {/* SEBI Registration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEBI Registration Number *
            </label>
            <input
              type="text"
              name="sebiRegNumber"
              value={formData.sebiRegNumber}
              onChange={handleChange}
              placeholder="INA000000000"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your unique SEBI registration identifier
            </p>
          </div>

          {/* SEBI Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sebiType: 'RIA' }))}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  formData.sebiType === 'RIA'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="font-semibold text-gray-900">RIA</div>
                <div className="text-xs text-gray-600 mt-1">Investment Advisor</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sebiType: 'RA' }))}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  formData.sebiType === 'RA'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="font-semibold text-gray-900">RA</div>
                <div className="text-xs text-gray-600 mt-1">Research Analyst</div>
              </button>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="5"
              min="0"
              className="input-field"
              required
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Specialty *
            </label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select your specialty</option>
              <option value="Value Investing">Value Investing</option>
              <option value="Growth Stocks">Growth Stocks</option>
              <option value="Options Trading">Options Trading</option>
              <option value="Dividend Investing">Dividend Investing</option>
              <option value="Swing Trading">Swing Trading</option>
              <option value="Mutual Funds">Mutual Funds</option>
              <option value="Technical Analysis">Technical Analysis</option>
              <option value="Fundamental Analysis">Fundamental Analysis</option>
            </select>
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualifications
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="CFA, CFP, MBA Finance (comma separated)"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your certifications separated by commas
            </p>
          </div>

          {/* Documents Upload (Future) */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Upload SEBI Certificate</p>
            <p className="text-xs text-gray-500">PDF or Image (Max 5MB)</p>
            <button
              type="button"
              className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
            >
              Choose File
            </button>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you confirm that all information is accurate and you agree to our advisor terms.
          </p>
        </form>
      </div>
    </div>
  )
}
