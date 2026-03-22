import { useEffect, useState } from "react"
import "../../Styles/profile.css"
import ProfileIC from "../../Images/profile_icon.svg"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext.jsx"

function Profile() {
  const [isOpen, setIsOpen] = useState(false)
  const { can } = useAuth()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        className="profile"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open site settings"
      >
        <img className="profile__icon" src={ProfileIC} alt="" />
      </button>

      {isOpen ? (
        <div className="profile-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Site settings"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-modal__header">
              <h2 className="profile-modal__title">Site settings</h2>
              <div className="profile-modal__header-right">
                {can("admin:enter") && (
                  <Link
                    to="/admin"
                    className="profile-modal__admin-btn"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>  
                )}
              </div>
              <button
                type="button"
                className="profile-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close settings"
              >
                x
              </button>
            </div>    
            <div className="profile-modal__body">
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card__label">Theme</div>
                  <select className="setting-card__control" defaultValue="light">
                    <option value="light">Light</option>
                    <option value="warm">Warm</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="setting-card">
                  <div className="setting-card__label">Language</div>
                  <select className="setting-card__control" defaultValue="ru">
                    <option value="ru">Russian</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <label className="setting-card setting-check">
                  <input type="checkbox" defaultChecked />
                  <span>Show product price badges</span>
                </label>

                <label className="setting-card setting-check">
                  <input type="checkbox" />
                  <span>Enable compact cards</span>
                </label>

                <div className="setting-card">
                  <div className="setting-card__label">Catalog density</div>
                  <input className="setting-card__control" type="range" min="1" max="3" defaultValue="2" />
                </div>

                <div className="setting-card">
                  <div className="setting-card__label">Currency (placeholder)</div>
                  <select className="setting-card__control" defaultValue="RUB">
                    <option value="RUB">RUB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-modal__footer">
              <button type="button" className="settings-btn settings-btn--ghost">
                Reset
              </button>
              <button type="button" className="settings-btn settings-btn--primary">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Profile
